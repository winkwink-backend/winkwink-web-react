import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TextSecretPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ Recupero mode e callback
  const mode = location.state?.mode ?? "encrypt";
  const onSelect = location.state?.onSelect ?? (() => {});

  const [text, setText] = useState("");

  const confirm = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSelect({
      type: "text",
      payload: trimmed,
      mode,
    });

    navigate(-1);
  };

  return (
    <div style={{ padding: 16 }}>
      {/* ⭐ FRECCIA BACK */}
      <button
        onClick={() => navigate(-1)}
        style={{
          fontSize: 24,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ⬅️
      </button>

      {/* ⭐ TITOLO */}
      <h2 style={{ textAlign: "center" }}>Testo segreto</h2>

      {/* ⭐ SOTTOTITOLO */}
      <p style={{ textAlign: "center", fontSize: 16 }}>
        Inserisci il testo da nascondere nel file
      </p>

      {/* ⭐ TEXTAREA */}
      <div
        style={{
          marginTop: 30,
          padding: 12,
          backgroundColor: "white",
          borderRadius: 14,
          border: "1px solid #ddd",
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: 16,
            color: "black",
          }}
          placeholder="Scrivi qui il tuo testo segreto…"
        />
      </div>

      {/* ⭐ CONFERMA */}
      <button
        onClick={confirm}
        className="wink-button"
        style={{ marginTop: 30 }}
      >
        ✔ Conferma
      </button>
    </div>
  );
}
