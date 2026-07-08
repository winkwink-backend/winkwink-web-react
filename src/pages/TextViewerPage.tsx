import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const TextViewerPage: React.FC = () => {
  const location = useLocation();
  const { path, name } = location.state as { path: string; name: string };

  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const loadText = async () => {
      try {
        const res = await fetch(`/api/text?path=${encodeURIComponent(path)}`);
        const content = await res.text();
        setText(content);
      } catch (e) {
        console.error("Errore caricamento testo:", e);
        setText("Errore nel caricamento del file di testo.");
      }
    };

    loadText();
  }, [path]);

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      {/* AppBar */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 16,
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {name}
      </div>

      {/* Body */}
      {text === null ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          <div className="loader-gold" />
        </div>
      ) : (
        <div
          style={{
            padding: 20,
            color: "white",
            fontSize: 16,
            lineHeight: "1.4",
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
