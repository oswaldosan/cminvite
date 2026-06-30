import { forwardRef, useEffect, useRef } from "react";
import { generate } from "../lib/qr.js";

const BoardingPass = forwardRef(function BoardingPass({ t, guest }, ref) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !guest) return;
    const payload =
      `CM AIRLINES 2026|PAX:${(guest.name || "GUEST").toUpperCase()}` +
      `|ID:${guest.id}|FLT:CM2026|DATE:08JUL2026|TONCONTIN|GATE:A8|SEAT:7J`;
    try {
      const res = generate(payload, "M");
      const n = res.size;
      const quiet = 2;
      const total = n + quiet * 2;
      const scale = Math.max(2, Math.floor(168 / total));
      const px = scale * total;
      c.width = px;
      c.height = px;
      c.style.width = `${px}px`;
      c.style.height = `${px}px`;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, px, px);
      ctx.fillStyle = "#0E3B2A";
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (res.modules[y][x]) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
        }
      }
    } catch {
      /* ignore */
    }
  }, [guest]);

  const pax = guest?.name?.trim() ? guest.name.toUpperCase() : t.pax_guest;
  const detailCell = (label, value, color = "#0B2A22") => (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#9AAAA4",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 16, color, marginTop: 3 }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="cm-pass-wrap cm-pop"
      style={{
        animationDelay: ".1s",
        width: "100%",
        maxWidth: 860,
        margin: "30px 0 0",
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 50px 110px -34px rgba(0,0,0,.6)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 26px",
          background: "linear-gradient(100deg,#0E3B2A,#0C5A50)",
        }}
      >
        <img
          src="/assets/cm-logo.webp"
          alt="CM Airlines"
          style={{ height: 26, filter: "brightness(0) invert(1)" }}
        />
        <div style={{ textAlign: "right", color: "#fff" }}>
          <div
            style={{
              fontFamily: "'Sora'",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: ".18em",
            }}
          >
            {t.bp_title}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: "rgba(255,255,255,.6)",
              letterSpacing: ".14em",
            }}
          >
            {t.bp_subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", background: "#fff" }}>
        <div
          style={{
            flex: "2 1 440px",
            padding: "28px clamp(22px,3vw,34px)",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Sora'",
                  fontWeight: 800,
                  fontSize: "clamp(34px,5vw,48px)",
                  lineHeight: 1,
                  color: "#0B2A22",
                }}
              >
                TGU
              </div>
              <div style={{ fontSize: 12, color: "#7A8B86", fontWeight: 600, marginTop: 4 }}>
                {t.bp_from_city}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0 6px",
              }}
            >
              <div style={{ color: "#0C9BA3", fontSize: 20 }}>✈</div>
              <div
                style={{
                  width: "100%",
                  height: 2,
                  marginTop: 4,
                  background:
                    "repeating-linear-gradient(90deg,#0C9BA3 0 7px,transparent 7px 13px)",
                }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Sora'",
                  fontWeight: 800,
                  fontSize: "clamp(34px,5vw,48px)",
                  lineHeight: 1,
                  color: "#0B2A22",
                }}
              >
                CM
              </div>
              <div style={{ fontSize: 12, color: "#7A8B86", fontWeight: 600, marginTop: 4 }}>
                {t.bp_to_city}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 26,
              paddingTop: 20,
              borderTop: "1.5px dashed #E2E8E5",
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#9AAAA4",
                fontWeight: 700,
              }}
            >
              {t.bp_passenger}
            </div>
            <div
              style={{
                fontFamily: "'Sora'",
                fontWeight: 700,
                fontSize: "clamp(19px,2.6vw,26px)",
                color: "#0B2A22",
                marginTop: 3,
                textTransform: "uppercase",
                letterSpacing: ".01em",
              }}
            >
              {pax}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px 12px",
              marginTop: 22,
            }}
          >
            {detailCell(t.bp_flight, "CM 2026")}
            {detailCell(t.bp_date, "08 JUL")}
            {detailCell(t.bp_boarding, "18:30")}
            {detailCell(t.bp_gate, "A8", "#0C9BA3")}
            {detailCell(t.bp_seat, "7J")}
            {detailCell(t.bp_class, t.bp_class_v)}
            {detailCell(t.bp_terminal, "Toncontín")}
            {detailCell(t.bp_time, "19:00")}
          </div>

          <div
            style={{
              marginTop: 24,
              height: 46,
              backgroundImage:
                "repeating-linear-gradient(90deg,#0B2A22 0 2px,transparent 2px 4px,#0B2A22 4px 7px,transparent 7px 9px,#0B2A22 9px 12px,transparent 12px 17px)",
              backgroundSize: "auto 100%",
            }}
          />
        </div>

        <div
          style={{
            flex: "1 1 240px",
            position: "relative",
            background: "#F6F9F8",
            borderLeft: "2px dashed #CBD8D3",
            padding: "26px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -13,
              left: -13,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#06231C",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -13,
              left: -13,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#06231C",
            }}
          />
          <div
            style={{
              fontFamily: "'Sora'",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: ".16em",
              color: "#0E3B2A",
            }}
          >
            {t.bp_title}
          </div>
          <canvas
            ref={canvasRef}
            width="150"
            height="150"
            style={{ margin: "16px 0 12px", width: 150, height: 150 }}
          />
          <div
            style={{ fontSize: 11, color: "#7A8B86", fontWeight: 600, lineHeight: 1.4 }}
          >
            {t.stub_scan}
          </div>
          <div
            style={{
              marginTop: 14,
              width: "100%",
              borderTop: "1.5px dashed #DCE4E1",
              paddingTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              textAlign: "left",
            }}
          >
            {stubCell(t.bp_seat, "7J")}
            {stubCell(t.bp_gate, "A8")}
            {stubCell(t.bp_seq, "027")}
            {stubCell(t.bp_flight, "CM2026")}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BoardingPass;

function stubCell(label, value) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#9AAAA4",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 14, color: "#0B2A22" }}
      >
        {value}
      </div>
    </div>
  );
}
