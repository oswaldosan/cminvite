import { lazy, Suspense, useEffect, useState } from "react";
import AmbientHero from "./components/AmbientHero.jsx";
import Header from "./components/Header.jsx";
import CheckinView from "./components/CheckinView.jsx";
import BoardingView from "./components/BoardingView.jsx";
import { DICT } from "./lib/dict.js";

// Staff-only routes pull in Firebase (+ the QR camera lib for the scanner) —
// load them only on their hash routes so the guest invitation stays light.
const ScannerView = lazy(() => import("./components/ScannerView.jsx"));
const RaffleView = lazy(() => import("./components/RaffleView.jsx"));
const ListView = lazy(() => import("./components/ListView.jsx"));

const currentRoute = () => window.location.hash.replace(/^#\/?/, "").toLowerCase();

function StaffFallback({ label }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#06231C",
        color: "#fff",
        fontFamily: "'Manrope',system-ui,sans-serif",
      }}
    >
      {label}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [guest, setGuest] = useState(null);
  const [route, setRoute] = useState(currentRoute());
  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (guest) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [guest]);

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Staff-only routes — not linked from the invitation.
  if (route === "scan") {
    return (
      <Suspense fallback={<StaffFallback label="Cargando escáner…" />}>
        <ScannerView />
      </Suspense>
    );
  }
  if (route === "raffle" || route === "rifa") {
    return (
      <Suspense fallback={<StaffFallback label="Cargando rifa…" />}>
        <RaffleView />
      </Suspense>
    );
  }
  if (route === "list" || route === "confirmados") {
    return (
      <Suspense fallback={<StaffFallback label="Cargando lista…" />}>
        <ListView />
      </Suspense>
    );
  }

  return (
    <div
      className="cm-page"
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        background:
          "radial-gradient(120% 90% at 78% -10%, #14776B 0%, #0C4B40 38%, #06231C 78%)",
      }}
    >
      <AmbientHero />
      <Header t={t} lang={lang} onLang={setLang} />

      {guest ? (
        <BoardingView t={t} guest={guest} onBack={() => setGuest(null)} />
      ) : (
        <CheckinView t={t} lang={lang} onConfirmed={setGuest} />
      )}

      <footer
        className="cm-noprint"
        style={{
          position: "relative",
          zIndex: 4,
          textAlign: "center",
          padding: "26px 20px 30px",
          color: "rgba(255,255,255,.45)",
          fontSize: 12,
          letterSpacing: ".06em",
        }}
      >
        <span>{t.footer}</span>
      </footer>
    </div>
  );
}
