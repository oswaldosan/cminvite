export default function Header({ t, lang, onLang }) {
  return (
    <header
      className="cm-noprint"
      style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px clamp(20px,5vw,64px)",
      }}
    >
      <img
        src="/assets/cm-logo.webp"
        alt="CM Airlines"
        style={{ height: 34, width: "auto", filter: "brightness(0) invert(1)" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span
          style={{
            color: "rgba(255,255,255,.75)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: ".02em",
          }}
        >
          {t.nav_help}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: 999,
            padding: 3,
            backdropFilter: "blur(6px)",
          }}
        >
          <button
            type="button"
            className={`cm-lang-btn ${lang === "es" ? "active" : "idle"}`}
            onClick={() => onLang("es")}
          >
            ES
          </button>
          <button
            type="button"
            className={`cm-lang-btn ${lang === "en" ? "active" : "idle"}`}
            onClick={() => onLang("en")}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
