// src/pages/faq/FaqPage.tsx

import React, { useState } from "react";
import WinkWinkScaffold from "../../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../../providers/ColorProvider";

import { AppConfig } from "../../config/AppConfig";

import "./FaqPage.css";

export default function FaqPage() {
  const theme = React.useContext(ColorProviderContext);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  // ------------------------------------------------------------
  // SEND QUESTION
  // ------------------------------------------------------------
  async function sendQuestion() {
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch(`${AppConfig.baseUrl}faq/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();

      if (res.status === 200) {
        setAnswer(data.answer);
      } else {
        setAnswer(`Errore: ${data.error}`);
      }
    } catch (e) {
      setAnswer("Errore di connessione");
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      appBarTitle="FAQ"
      showColorSelector={false}
    >
      <div className="faq-container">
        {/* INPUT */}
        <input
          className="faq-input"
          placeholder="Fai una domanda"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ color: theme?.text }}
        />

        {/* BUTTON */}
        <button
          className="faq-btn"
          style={{
            background: theme?.background,
            color: theme?.text,
          }}
          disabled={loading}
          onClick={sendQuestion}
        >
          {loading ? "..." : "Invia domanda"}
        </button>

        {/* ANSWER */}
        {answer && (
          <div className="faq-answer">
            {answer}
          </div>
        )}

        {/* STATIC FAQ */}
        {!answer && (
          <div className="faq-static">
            {/* Qui puoi inserire l10n.faqContent */}
            <p>
              Qui trovi le risposte alle domande più frequenti su WinkWink.
              Se hai bisogno di aiuto, puoi inviare una domanda sopra.
            </p>
            <p>
              • Come funziona la crittografia?  
              • Dove vengono salvati i file?  
              • Come posso recuperare un messaggio?  
              • Come funziona la modalità alias?
            </p>
          </div>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
