import BoardingPass from "./BoardingPass.jsx";
import RsvpCards from "./RsvpCards.jsx";
import { downloadIcs } from "../lib/guests.js";

export default function BoardingView({ t, guest, onBack }) {
  return (
    <main
      style={{
        position: "relative",
        zIndex: 4,
        maxWidth: 980,
        margin: "0 auto",
        padding: "clamp(8px,2vw,24px) clamp(16px,5vw,40px) 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div className="cm-noprint cm-pop" style={{ textAlign: "center", color: "#fff" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'Sora'",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#9FD356",
            background: "rgba(134,196,64,.12)",
            border: "1px solid rgba(134,196,64,.35)",
            padding: "7px 15px",
            borderRadius: 999,
          }}
        >
          ✓ {t.boarding_kicker}
        </span>
        <h2
          style={{
            fontFamily: "'Sora'",
            fontWeight: 800,
            fontSize: "clamp(28px,4vw,42px)",
            margin: "18px 0 8px",
            letterSpacing: "-.01em",
          }}
        >
          {t.boarding_title}
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,.78)",
            margin: "0 auto",
            maxWidth: "46ch",
            lineHeight: 1.5,
          }}
        >
          {t.boarding_sub}
        </p>
      </div>

      <BoardingPass t={t} guest={guest} />

      <div
        className="cm-noprint"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          marginTop: 26,
        }}
      >
        <button
          type="button"
          onClick={() => window.print()}
          className="cm-btn-white"
          style={{
            cursor: "pointer",
            border: "none",
            borderRadius: 12,
            padding: "13px 22px",
            fontFamily: "'Sora'",
            fontWeight: 700,
            fontSize: 14,
            color: "#0E3B2A",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 10px 24px -12px rgba(0,0,0,.5)",
          }}
        >
          ⬇ {t.btn_download}
        </button>
        <button
          type="button"
          onClick={() => downloadIcs(t)}
          className="cm-btn-ghost"
          style={{
            cursor: "pointer",
            borderRadius: 12,
            padding: "13px 22px",
            fontFamily: "'Sora'",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.28)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🗓️ {t.btn_cal}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="cm-btn-outline"
          style={{
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,.28)",
            borderRadius: 12,
            padding: "13px 22px",
            fontFamily: "'Sora'",
            fontWeight: 700,
            fontSize: 14,
            color: "rgba(255,255,255,.85)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← {t.btn_back}
        </button>
      </div>

      <RsvpCards t={t} />
    </main>
  );
}
