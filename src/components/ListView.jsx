import { useEffect, useMemo, useState } from "react";
import { subscribeCheckins, formatCheckinTime } from "../lib/checkins.js";

function toMillis(at) {
  if (!at) return 0;
  if (typeof at.toMillis === "function") return at.toMillis();
  if (typeof at.seconds === "number") return at.seconds * 1000;
  return new Date(at).getTime() || 0;
}

export default function ListView() {
  const [all, setAll] = useState([]);
  const [empresa, setEmpresa] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => subscribeCheckins(setAll), []);

  const empresas = useMemo(() => {
    const set = new Set();
    all.forEach((g) => set.add(g.empresa || "— Sin empresa"));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [all]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((g) => {
        if (empresa) {
          const e = g.empresa || "— Sin empresa";
          if (e !== empresa) return false;
        }
        if (q) {
          const hay = `${g.nombre} ${g.identidad} ${g.empresa}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => toMillis(b.at) - toMillis(a.at)); // most recent first
  }, [all, empresa, search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(120% 90% at 78% -10%, #14776B 0%, #0C4B40 38%, #06231C 78%)",
        color: "#fff",
        fontFamily: "'Manrope',system-ui,sans-serif",
        padding: "clamp(16px,4vw,32px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 20 }}>
            Confirmados
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 999,
              padding: "5px 12px",
              whiteSpace: "nowrap",
            }}
          >
            {filtered.length}
            {filtered.length !== all.length ? ` / ${all.length}` : ""} ingresos
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nombre o identidad…"
            style={{
              flex: "1 1 220px",
              border: "1px solid rgba(255,255,255,.25)",
              background: "rgba(255,255,255,.1)",
              color: "#fff",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 15,
              outline: "none",
            }}
          />
          <select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            style={{
              flex: "0 1 200px",
              border: "1px solid rgba(255,255,255,.25)",
              background: "rgba(6,35,28,.6)",
              color: "#fff",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 15,
              outline: "none",
            }}
          >
            <option value="">Todas las empresas</option>
            {empresas.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,.6)",
              padding: "48px 0",
              fontSize: 14,
            }}
          >
            {all.length === 0 ? "Aún no hay ingresos confirmados." : "Sin resultados para el filtro."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((g) => (
              <div
                key={g.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Sora'",
                      fontWeight: 700,
                      fontSize: 15,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.nombre || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                    {g.empresa || "Sin empresa"} · {g.identidad}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9FD356",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCheckinTime(g.at) || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
