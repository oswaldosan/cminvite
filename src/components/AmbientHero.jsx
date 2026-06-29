export default function AmbientHero() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "-160px",
          right: "-120px",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(22,188,196,.30),transparent 65%)",
          filter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "-140px",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(134,196,64,.14),transparent 66%)",
        }}
      />
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}
      >
        <path
          d="M-40 720 C 360 540, 760 540, 1040 360 S 1480 150, 1520 90"
          fill="none"
          stroke="rgba(255,255,255,.28)"
          strokeWidth="2"
          strokeDasharray="2 12"
          strokeLinecap="round"
          style={{ animation: "cmDash 36s linear infinite" }}
        />
        <g
          style={{
            offsetPath: "path('M-40 720 C 360 540, 760 540, 1040 360 S 1480 150, 1520 90')",
            animation: "cmPlane 22s linear infinite",
          }}
        >
          <g transform="rotate(-22)">
            <path
              d="M2 0 L-18 7 L-12 0 L-18 -7 Z M-12 0 L-30 2 L-30 -2 Z"
              fill="rgba(245,197,24,.9)"
              transform="scale(1.6)"
            />
          </g>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg,rgba(6,35,28,.05),rgba(6,35,28,.45))",
        }}
      />
    </div>
  );
}
