// src/pages/faq/FaqSmartPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../../providers/ColorProvider";

import "./FaqSmartPage.css";

export default function FaqSmartPage() {
  const navigate = useNavigate();
  const theme = React.useContext(ColorProviderContext);

  const [faqData, setFaqData] = useState<Record<string, any>>({});
  const [query, setQuery] = useState("");
  const [bestMatch, setBestMatch] = useState<any | null>(null);

  // ------------------------------------------------------------
  // LOAD FAQ JSON (WEB)
  // ------------------------------------------------------------
  useEffect(() => {
    (async () => {
      const res = await fetch("/assets/faq/faq_it.json");
      const json = await res.json();
      setFaqData(json);
    })();
  }, []);

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------
  function search(text: string) {
    setQuery(text);
    setBestMatch(findBestMatch(text));
  }

  // ------------------------------------------------------------
  // FIND BEST MATCH
  // ------------------------------------------------------------
  function findBestMatch(text: string) {
    if (!text.trim()) return null;

    const lower = text.toLowerCase();
    let bestScore = 0;
    let best: any = null;

    Object.values(faqData).forEach((item: any) => {
      const keywords = item.keywords || [];
      let score = 0;

      for (const k of keywords) {
        if (lower.includes(k.toLowerCase())) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });

    return bestScore > 0 ? best : null;
  }

  // ------------------------------------------------------------
  // NAVIGATION ACTIONS
  // ------------------------------------------------------------
  function navigateAction(action: string) {
    const routes: Record<string, string> = {
      encrypt: "/encrypt",
      contacts: "/contacts",
      winkstore: "/winkstore",
      games: "/games",
      passwordResetRequest: "/password-reset",
    };

    const route = routes[action];
    if (route) navigate(route);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div className="fs-container">
        {/* SEARCH FIELD */}
        <input
          className="fs-input"
          placeholder="Cerca nella FAQ…"
          value={query}
          onChange={(e) => search(e.target.value)}
        />

        <div className="fs-spacing" />

        {/* RESULTS */}
        <div className="fs-results">
          {!bestMatch ? (
            <div className="fs-no-results" style={{ color: theme?.text }}>
              Nessun risultato trovato
            </div>
          ) : (
            <div className="fs-answer-box">
              <div
                className="fs-answer"
                style={{ color: theme?.text }}
              >
                {bestMatch.answer}
              </div>

              <div className="fs-actions">
                {bestMatch.actions?.map((action: string, i: number) => (
                  <button
                    key={i}
                    className="fs-action-btn"
                    onClick={() => navigateAction(action)}
                  >
                    {
                      {
                        encrypt: "Vai a Encrypt",
                        scanQr: "Scannerizza QR",
                        contacts: "Vai ai Contatti",
                        videoWW: "Video WinkWink",
                        passwordResetRequest: "Reset Password",
                      }[action]
                    }
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
