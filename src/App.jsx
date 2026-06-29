import { useEffect, useState } from "react";
import AmbientHero from "./components/AmbientHero.jsx";
import Header from "./components/Header.jsx";
import CheckinView from "./components/CheckinView.jsx";
import BoardingView from "./components/BoardingView.jsx";
import { DICT } from "./lib/dict.js";

export default function App() {
  const [lang, setLang] = useState("es");
  const [guest, setGuest] = useState(null);
  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (guest) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [guest]);

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
