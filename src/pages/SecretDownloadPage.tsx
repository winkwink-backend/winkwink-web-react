import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SecretDownloadService } from "../services/SecretDownloadService";

export const SecretDownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(SecretDownloadService.instance.items);

  useEffect(() => {
    const refresh = () =>
    setItems([...SecretDownloadService.instance.items]);

    SecretDownloadService.instance.subscribe(refresh);
    return () => SecretDownloadService.instance.unsubscribe(refresh);
  }, []);

  const openDecrypt = (filePath: string) => {
    navigate("/decrypt", {
      state: { filePath },
    });
  };

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      {/* 🔥 AppBar */}
      <div
        style={{
          backgroundColor: "black",
          padding: 16,
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        File Segreti in Arrivo
      </div>

      {/* 🔥 Body */}
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            marginTop: 80,
            color: "white54",
            fontSize: 18,
          }}
        >
          Nessun file in arrivo
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {/* 🔥 Nome file */}
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                {item.fileName}
              </div>

              {/* 🔥 Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${item.progress}%`,
                    height: "100%",
                    backgroundColor: "green",
                  }}
                />
              </div>

              {/* 🔥 Percentuale */}
              <div style={{ color: "white70", marginBottom: 10 }}>
                {item.progress.toFixed(0)}%
              </div>

              {/* 🔥 Bottone "Apri in Decripta" */}
              {item.status === "completed" && item.filePath && (
                <button
                  onClick={() => openDecrypt(item.filePath!)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Apri in Decripta
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
