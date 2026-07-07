import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
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

  const [running, setRunning] = useState(false);
  const [camError, setCamError] = useState("");
  const [result, setResult] = useState(null); // { type, guest, at, detail }
  const [count, setCount] = useState(null);
  const [manualId, setManualId] = useState("");

  useEffect(() => subscribeCheckinCount(setCount), []);

  async function handleDecoded(text) {
    const now = Date.now();
    if (busyRef.current) return;
    if (lastScanRef.current.value === text && now - lastScanRef.current.at < SCAN_COOLDOWN_MS) return;
    lastScanRef.current = { value: text, at: now };
    busyRef.current = true;
    try {
      await processId(parseQrPayload(text).id, text);
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, 900);
    }
  }

  async function processId(normId, rawLabel) {
    const guest = findGuest(normId);
    if (!guest) {
      setResult({ type: "invalid", detail: rawLabel || normId });
      return;
    }
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
    }
  }

  async function startScanner() {
    setCamError("");
    const scanner = new Html5Qrcode(REGION_ID, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      // Use the device's native, hardware-accelerated barcode reader when
      // available (Android Chrome) — far more reliable on dense QR codes.
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    });
    scannerRef.current = scanner;
    try {
      await scanner.start(
        // Request a higher-resolution rear camera so dense QR codes resolve.
        { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        {
          fps: 10,
          // Responsive scan box: 75% of the smaller video dimension.
          qrbox: (vw, vh) => {
            const size = Math.floor(Math.min(vw, vh) * 0.75);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
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
    if (!val) return;
    processId(parseQrPayload(val).id || val.replace(/[^0-9a-zA-Z]/g, "").toUpperCase(), val);
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

        {/* Result banner */}
        {rs ? (
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
