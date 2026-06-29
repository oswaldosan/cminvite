const CONTACTS = [
  {
    initials: "AC",
    bg: "#0C9BA3",
    color: "#fff",
    name: "Andrés Cerna",
    region: "TGU",
    tel: "+50494534533",
    telLabel: "+504 9453-4533",
    email: "Andres@cmairlines.com",
  },
  {
    initials: "KM",
    bg: "#86C440",
    color: "#0E3B2A",
    name: "Karen Moreno",
    region: "SAP",
    tel: "+50494505474",
    telLabel: "+504 9450-5474",
    email: "Kmoreno@cmairlines.com",
  },
];

export default function RsvpCards({ t }) {
  return (
    <div className="cm-noprint" style={{ width: "100%", maxWidth: 860, margin: "44px 0 0" }}>
      <div style={{ textAlign: "center", color: "#fff", marginBottom: 18 }}>
        <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 19 }}>{t.rsvp_title}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.62)" }}>{t.rsvp_sub}</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 14,
        }}
      >
        {CONTACTS.map((c) => (
          <div
            key={c.email}
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: 16,
              padding: "18px 20px",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: c.bg,
                  color: c.color,
                  fontFamily: "'Sora'",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {c.initials}
              </span>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Sora'" }}>
                  {c.name}
                </div>
                <div
                  style={{
                    color: "#9FD356",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                  }}
                >
                  {c.region}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <a
                href={`tel:${c.tel}`}
                style={{
                  color: "rgba(255,255,255,.85)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                📞 {c.telLabel}
              </a>
              <a
                href={`mailto:${c.email}`}
                style={{
                  color: "rgba(255,255,255,.85)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                ✉ {c.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
