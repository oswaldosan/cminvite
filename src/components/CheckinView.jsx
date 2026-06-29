import { useState } from "react";
import { findGuest } from "../lib/guests.js";

export default function CheckinView({ t, lang, onConfirmed }) {
  const [idnum, setIdnum] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    const value = idnum.trim();
    if (value.length < 4) {
      setError(t.err_required);
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      const guest = findGuest(value);
      if (!guest) {
        setSubmitting(false);
        setError(t.err_not_found);
        return;
      }
      setSubmitting(false);
      onConfirmed({ id: guest.id, name: guest.nombre });
    }, 900);
  };

  return (
    <main
      id="viewCheckin"
      style={{
        position: "relative",
        zIndex: 4,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))",
        gap: "clamp(28px,5vw,72px)",
        alignItems: "center",
        maxWidth: 1240,
        margin: "0 auto",
        padding: "clamp(20px,4vw,52px) clamp(20px,5vw,64px) 72px",
      }}
    >
      <section className="cm-fade-up" style={{ color: "#fff" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'Sora'",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "#F5C518",
            background: "rgba(245,197,24,.10)",
            border: "1px solid rgba(245,197,24,.35)",
            padding: "7px 14px",
            borderRadius: 999,
          }}
        >
          ✦ {t.kicker}
        </span>
        <p
          style={{
            margin: "24px 0 6px",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: ".04em",
            color: "rgba(255,255,255,.7)",
          }}
        >
          {t.invite_kicker}
        </p>
        <h1
          style={{
            fontFamily: "'Sora'",
            fontWeight: 800,
            fontSize: "clamp(38px,5.4vw,68px)",
            lineHeight: 1.02,
            margin: 0,
            letterSpacing: "-.02em",
          }}
        >
          <span>{t.event_title}</span>
          <br />
          <span
            style={{
              background: "linear-gradient(90deg,#16BCC4,#86C440)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t.event_brand}
          </span>
        </h1>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "34px 0 0" }}>
          {[
            { icon: "🗓️", l: t.d_date_l, v: t.d_date_v },
            { icon: "🕖", l: t.d_time_l, v: t.d_time_v },
            { icon: "📍", l: t.d_place_l, v: t.d_place_v },
            { icon: "🥂", l: t.d_dress_l, v: t.d_dress_v },
          ].map((pill, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.14)",
                borderRadius: 14,
                padding: "11px 15px",
                backdropFilter: "blur(6px)",
              }}
            >
              <span style={{ fontSize: 18 }}>{pill.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.55)",
                    fontWeight: 700,
                  }}
                >
                  {pill.l}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pill.v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="cm-fade-up"
        style={{
          animationDelay: ".1s",
          background: "#fff",
          borderRadius: 26,
          padding: "clamp(24px,3vw,38px)",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.4)",
        }}
      >
        <Stepper t={t} />

        <h2
          style={{
            fontFamily: "'Sora'",
            fontWeight: 800,
            fontSize: 27,
            margin: 0,
            letterSpacing: "-.01em",
            color: "#0B2A22",
          }}
        >
          {t.checkin_title}
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5A6B66", margin: "9px 0 26px" }}>
          {t.checkin_sub}
        </p>

        <form onSubmit={onSubmit} noValidate>
          <label
            htmlFor="cmId"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: "#0B2A22",
              marginBottom: 8,
            }}
          >
            {t.id_label}
          </label>
          <input
            id="cmId"
            className="cm-input"
            value={idnum}
            onChange={(e) => {
              setIdnum(e.target.value);
              if (error) setError("");
            }}
            placeholder={t.id_ph}
            inputMode="numeric"
            autoComplete="off"
            style={{
              width: "100%",
              border: "1.6px solid #DCE4E1",
              borderRadius: 13,
              padding: "14px 16px",
              fontSize: 15.5,
              color: "#0B2A22",
              outline: "none",
              transition: "border-color .18s",
            }}
          />

          {error ? (
            <p
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
                color: "#C0392B",
                fontSize: 13,
                fontWeight: 600,
                margin: "12px 0 0",
                lineHeight: 1.45,
              }}
            >
              ⚠ <span>{error}</span>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="cm-btn-primary"
            style={{
              width: "100%",
              marginTop: 24,
              border: "none",
              cursor: submitting ? "progress" : "pointer",
              opacity: submitting ? 0.75 : 1,
              borderRadius: 13,
              padding: 16,
              fontFamily: "'Sora'",
              fontSize: 15.5,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(100deg,#0C9BA3,#0E3B2A)",
              boxShadow: "0 14px 30px -10px rgba(12,155,163,.6)",
              transition: "transform .15s,filter .15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
            }}
          >
            <span>{submitting ? t.cta_loading : t.cta}</span>
            <span style={{ fontSize: 17 }}>→</span>
          </button>
        </form>

        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontSize: 12,
            color: "#8AA39B",
            margin: "16px 0 0",
            fontWeight: 500,
          }}
        >
          🔒 <span>{t.secure_note}</span>
        </p>
      </section>
    </main>
  );
}

function Stepper({ t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#0C9BA3",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "'Sora'",
          }}
        >
          1
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0B2A22" }}>{t.step1}</span>
      </div>
      <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#0C9BA3,#dfe7e5)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#EAF0EE",
            color: "#8AA39B",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "'Sora'",
          }}
        >
          2
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8AA39B" }}>{t.step2}</span>
      </div>
      <div style={{ flex: 1, height: 2, background: "#dfe7e5" }} />
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#EAF0EE",
          color: "#8AA39B",
          fontSize: 12,
          fontWeight: 800,
          fontFamily: "'Sora'",
        }}
      >
        3
      </span>
    </div>
  );
}
