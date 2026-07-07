import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { findGuest } from "../lib/guests.js";
import { parseQrPayload } from "../lib/qrPayload.js";
import { recordCheckin, subscribeCheckinCount, formatCheckinTime } from "../lib/checkins.js";

const REGION_ID = "cm-qr-region";
const SCAN_COOLDOWN_MS = 2500;

const RESULT_STYLES = {
  confirmed: { bg: "#0E7C4B", label: "INGRESO CONFIRMADO", icon: "✓" },
  already: { bg: "#B7791F", label: "YA HABÍA INGRESADO", icon: "!" },
  invalid: { bg: "#B02A2A", label: "NO ESTÁ EN LA LISTA", icon: "✕" },
  error: { bg: "#B02A2A", label: "ERROR AL REGISTRAR", icon: "✕" },
};

export default function ScannerView() {
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ value: "", at: 0 });
  const busyRef = useRef(false);
  const pendingRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [camError, setCamError] = useState("");
  const [result, setResult] = useState(null); // { type, guest, at, detail }
  const [pending, setPending] = useState(null); // guest awaiting confirmation
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(null);
  const [manualId, setManualId] = useState("");

  useEffect(() => subscribeCheckinCount(setCount), []);

  function handleDecoded(text) {
    const now = Date.now();
    // Ignore new scans while busy or while a confirmation is pending.
    if (busyRef.current || pendingRef.current) return;
    if (lastScanRef.current.value === text && now - lastScanRef.current.at < SCAN_COOLDOWN_MS) return;
    lastScanRef.current = { value: text, at: now };
    busyRef.current = true;
    stageId(parseQrPayload(text).id, text);
  }

  // Look up the guest and stage them for confirmation — does NOT write yet.
  function stageId(normId, rawLabel) {
    const guest = findGuest(normId);
    if (!guest) {
      setResult({ type: "invalid", detail: rawLabel || normId });
      setTimeout(() => {
        busyRef.current = false;
      }, 900);
      return;
    }
    setResult(null);
    pendingRef.current = guest;
    setPending(guest);
    // busyRef stays true until the staff confirms or cancels.
  }

  function cancelPending() {
    pendingRef.current = null;
    setPending(null);
    busyRef.current = false;
    lastScanRef.current = { value: "", at: 0 };
  }

  async function confirmPending() {
    const guest = pendingRef.current;
    if (!guest || saving) return;
    setSaving(true);
    try {
      const res = await recordCheckin(guest, "qr");
      setResult({
        type: res.status === "already" ? "already" : "confirmed",
        guest,
        at: res.at ? formatCheckinTime(res.at) : "",
      });
    } catch (err) {
      console.error("checkin error", err);
      setResult({ type: "error", guest, detail: err?.message || "" });
    } finally {
      setSaving(false);
      cancelPending();
    }
  }

  async function startScanner() {
    setCamError("");
    const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleDecoded,
        () => {}
      );
      setRunning(true);
    } catch (err) {
      setCamError(
        "No se pudo acceder a la cámara. Revisa permisos o usa el ingreso manual. " +
          (err?.message || "")
      );
    }
  }

  async function stopScanner() {
    const s = scannerRef.current;
    if (s) {
      try {
        await s.stop();
        await s.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s) s.stop().then(() => s.clear()).catch(() => {});
    };
  }, []);

  function submitManual(e) {
    e.preventDefault();
    const val = manualId.trim();
    if (!val || pendingRef.current) return;
    stageId(parseQrPayload(val).id || val.replace(/[^0-9a-zA-Z]/g, "").toUpperCase(), val);
    setManualId("");
  }

  const rs = result ? RESULT_STYLES[result.type] : null;

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
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 18 }}>
            Control de ingreso
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 999,
              padding: "5px 12px",
            }}
          >
            {count == null ? "…" : `${count} ingresos`}
          </div>
        </div>

        {/* Confirmation card — shown after a scan/manual lookup, before writing */}
        {pending ? (
          <div
            style={{
              background: "#fff",
              color: "#0B2A22",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 16,
              boxShadow: "0 18px 40px -18px rgba(0,0,0,.6)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#8AA39B",
                fontWeight: 700,
              }}
            >
              Confirmar ingreso
            </div>
            <div
              style={{
                fontFamily: "'Sora'",
                fontWeight: 800,
                fontSize: 20,
                marginTop: 6,
                textTransform: "uppercase",
                lineHeight: 1.15,
              }}
            >
              {pending.nombre}
            </div>
            {pending.empresa ? (
              <div style={{ fontSize: 13, color: "#0C9BA3", fontWeight: 700, marginTop: 2 }}>
                {pending.empresa}
              </div>
            ) : null}
            <div style={{ fontSize: 13, color: "#5A6B66", marginTop: 6 }}>
              ID: {pending.id}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={confirmPending}
                disabled={saving}
                style={{
                  flex: 2,
                  cursor: saving ? "progress" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  border: "none",
                  borderRadius: 12,
                  padding: "14px",
                  fontFamily: "'Sora'",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#fff",
                  background: "linear-gradient(100deg,#0E7C4B,#0E3B2A)",
                }}
              >
                {saving ? "Registrando…" : "✓ Confirmar ingreso"}
              </button>
              <button
                type="button"
                onClick={cancelPending}
                disabled={saving}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  border: "1.5px solid #DCE4E1",
                  borderRadius: 12,
                  padding: "14px",
                  fontFamily: "'Sora'",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#5A6B66",
                  background: "#fff",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}

        {/* Result banner */}
        {!pending && rs ? (
          <div
            style={{
              background: rs.bg,
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 16,
              textAlign: "center",
              boxShadow: "0 18px 40px -18px rgba(0,0,0,.6)",
            }}
          >
            <div style={{ fontSize: 34, lineHeight: 1 }}>{rs.icon}</div>
            <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 16, marginTop: 6 }}>
              {rs.label}
            </div>
            {result.guest ? (
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700, textTransform: "uppercase" }}>
                {result.guest.nombre}
              </div>
            ) : null}
            {result.guest?.empresa ? (
              <div style={{ fontSize: 12, opacity: 0.85 }}>{result.guest.empresa}</div>
            ) : null}
            {result.type === "already" && result.at ? (
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
                Ingresó a las {result.at}
              </div>
            ) : null}
            {result.type === "invalid" ? (
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8, wordBreak: "break-all" }}>
                {result.detail}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Camera region */}
        <div
          id={REGION_ID}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            background: "rgba(0,0,0,.35)",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.15)",
          }}
        />

        {camError ? (
          <p style={{ color: "#FFD1D1", fontSize: 13, marginTop: 10 }}>{camError}</p>
        ) : null}

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {!running ? (
            <button type="button" onClick={startScanner} style={btnPrimary}>
              ▶ Iniciar cámara
            </button>
          ) : (
            <button type="button" onClick={stopScanner} style={btnGhost}>
              ⏸ Detener
            </button>
          )}
        </div>

        {/* Manual fallback */}
        <form onSubmit={submitManual} style={{ marginTop: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>
            Ingreso manual por identidad
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Número de identidad"
              inputMode="numeric"
              style={{
                flex: 1,
                border: "1px solid rgba(255,255,255,.25)",
                background: "rgba(255,255,255,.1)",
                color: "#fff",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 15,
                outline: "none",
              }}
            />
            <button type="submit" style={btnWhite}>
              Validar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const btnBase = {
  flex: 1,
  cursor: "pointer",
  borderRadius: 12,
  padding: "13px 18px",
  fontFamily: "'Sora'",
  fontWeight: 700,
  fontSize: 14,
};
const btnPrimary = {
  ...btnBase,
  border: "none",
  color: "#0E3B2A",
  background: "#fff",
};
const btnGhost = {
  ...btnBase,
  border: "1px solid rgba(255,255,255,.3)",
  color: "#fff",
  background: "transparent",
};
const btnWhite = {
  cursor: "pointer",
  border: "none",
  color: "#0E3B2A",
  background: "#fff",
  borderRadius: 10,
  padding: "12px 16px",
  fontFamily: "'Sora'",
  fontWeight: 700,
  fontSize: 14,
};
