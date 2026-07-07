import { useEffect, useMemo, useRef, useState } from "react";
import { subscribeCheckins, isRaffleEligible } from "../lib/checkins.js";

const SEGMENT_COLORS = ["#0C9BA3", "#0E3B2A", "#16BCC4", "#0E7C4B", "#14776B", "#86C440"];
const TAU = Math.PI * 2;

// Cryptographically fair random integer in [0, n).
function secureRandomInt(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

export default function RaffleView() {
  const [all, setAll] = useState([]);
  const [excludedKeys, setExcludedKeys] = useState(() => new Set()); // past winners
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => subscribeCheckins(setAll), []);

  // Eligible = confirmed check-in, not CM Airlines/Staff, not already a winner.
  const participants = useMemo(
    () =>
      all
        .filter((g) => isRaffleEligible(g.empresa))
        .filter((g) => !excludedKeys.has(g.key)),
    [all, excludedKeys]
  );

  // Shuffle the wheel order (Fisher-Yates, crypto) so names aren't in a fixed
  // Firestore order — reshuffles only when the eligible set changes.
  const eligibleSig = participants.map((p) => p.key).sort().join(",");
  const wheelOrder = useMemo(() => {
    const arr = participants.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleSig]);

  const excludedByRule = all.length - all.filter((g) => isRaffleEligible(g.empresa)).length;

  useEffect(() => {
    drawWheel(rotationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelOrder]);

  function drawWheel(rotation) {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const size = c.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;
    const n = wheelOrder.length;
    ctx.clearRect(0, 0, size, size);

    if (n === 0) {
      ctx.fillStyle = "rgba(255,255,255,.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();
      return;
    }

    const seg = TAU / n;
    const showNames = n <= 40;
    for (let i = 0; i < n; i++) {
      const start = rotation + i * seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (showNames) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + seg / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "600 18px 'Manrope',sans-serif";
        const name = wheelOrder[i].nombre.split(" ").slice(0, 2).join(" ");
        ctx.fillText(name.length > 18 ? name.slice(0, 17) + "…" : name, r - 18, 6);
        ctx.restore();
      }
    }

    // hub
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, TAU);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#0E3B2A";
    ctx.font = "800 26px 'Sora',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CM", cx, cy);
    ctx.textBaseline = "alphabetic";
  }

  function spin() {
    const n = wheelOrder.length;
    if (spinning || n === 0) return;
    setWinner(null);
    setSpinning(true);

    const winnerIdx = secureRandomInt(n);
    const seg = TAU / n;
    // Pointer sits at the top (−90° = 3π/2). Rotate so the winner segment
    // centre lands under the pointer, plus a random extra offset within the
    // segment and many full turns so every spin looks different.
    const jitter = (secureRandomInt(1000) / 1000 - 0.5) * seg * 0.8;
    const target = (3 * TAU) / 4 - (winnerIdx * seg + seg / 2) + jitter;
    const fullTurns = (8 + secureRandomInt(7)) * TAU; // 8–14 full turns
    const start = rotationRef.current % TAU;
    const end = target + fullTurns;
    const duration = 5600 + secureRandomInt(2600); // 5.6–8.2s
    let t0 = null;

    const ease = (x) => 1 - Math.pow(1 - x, 4); // easeOutQuart — long dramatic slow-down

    function frame(ts) {
      if (t0 == null) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      rotationRef.current = start + (end - start) * ease(p);
      drawWheel(rotationRef.current);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        setWinner(wheelOrder[winnerIdx]);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function removeWinnerAndContinue() {
    if (winner) setExcludedKeys((prev) => new Set(prev).add(winner.key));
    setWinner(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(120% 90% at 78% -10%, #14776B 0%, #0C4B40 38%, #06231C 78%)",
        color: "#fff",
        fontFamily: "'Manrope',system-ui,sans-serif",
        padding: "clamp(16px,4vw,32px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 780, textAlign: "center" }}>
        <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 26 }}>Rifa CM Airlines</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", marginTop: 4 }}>
          {participants.length} participantes elegibles
          {excludedByRule > 0 ? ` · ${excludedByRule} excluidos (CM Airlines / Staff)` : ""}
          {excludedKeys.size > 0 ? ` · ${excludedKeys.size} ya ganaron` : ""}
        </div>

        {/* Wheel + pointer */}
        <div style={{ position: "relative", width: "min(96vw, 680px)", margin: "28px auto 0" }}>
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "22px solid transparent",
              borderRight: "22px solid transparent",
              borderTop: "36px solid #F5C518",
              zIndex: 2,
              filter: "drop-shadow(0 3px 5px rgba(0,0,0,.45))",
            }}
          />
          <canvas
            ref={canvasRef}
            width={1000}
            height={1000}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "50%",
              boxShadow: "0 34px 80px -30px rgba(0,0,0,.7)",
            }}
          />
        </div>

        {/* Winner reveal */}
        {winner ? (
          <div
            className="cm-pop"
            style={{
              background: "#fff",
              color: "#0B2A22",
              borderRadius: 18,
              padding: "22px 20px",
              margin: "24px 0 0",
              boxShadow: "0 22px 50px -20px rgba(0,0,0,.6)",
            }}
          >
            <div style={{ fontSize: 30 }}>🎉</div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "#8AA39B",
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              Ganador
            </div>
            <div
              style={{
                fontFamily: "'Sora'",
                fontWeight: 800,
                fontSize: 24,
                textTransform: "uppercase",
                lineHeight: 1.15,
                marginTop: 4,
              }}
            >
              {winner.nombre}
            </div>
            {winner.empresa ? (
              <div style={{ color: "#0C9BA3", fontWeight: 700, fontSize: 14, marginTop: 2 }}>
                {winner.empresa}
              </div>
            ) : null}
            <button
              type="button"
              onClick={removeWinnerAndContinue}
              style={{
                marginTop: 16,
                cursor: "pointer",
                border: "1.5px solid #DCE4E1",
                borderRadius: 12,
                padding: "12px 18px",
                fontFamily: "'Sora'",
                fontWeight: 700,
                fontSize: 14,
                color: "#5A6B66",
                background: "#fff",
              }}
            >
              Sacar de la rifa y seguir
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={spin}
          disabled={spinning || participants.length === 0}
          style={{
            marginTop: 24,
            width: "100%",
            maxWidth: 320,
            cursor: spinning || participants.length === 0 ? "not-allowed" : "pointer",
            opacity: spinning || participants.length === 0 ? 0.6 : 1,
            border: "none",
            borderRadius: 14,
            padding: "16px",
            fontFamily: "'Sora'",
            fontWeight: 800,
            fontSize: 16,
            color: "#0E3B2A",
            background: "linear-gradient(100deg,#F5C518,#86C440)",
            boxShadow: "0 16px 34px -14px rgba(245,197,24,.6)",
          }}
        >
          {spinning ? "Girando…" : participants.length === 0 ? "Sin participantes" : "🎡 Girar la ruleta"}
        </button>
      </div>
    </div>
  );
}
