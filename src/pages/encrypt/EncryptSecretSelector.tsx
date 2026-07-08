import React from "react";
import { useNavigate } from "react-router-dom";
import type { SecretData } from "../../types/SecretData";   // ⭐ usa SOLO questo

type Props = {
  selectedSecret: SecretData | null;
  onSecretSelected: (secret: SecretData) => void;
  onSecretCleared: () => void;
};

export default function EncryptSecretSelector({
  selectedSecret,
  onSecretSelected,
  onSecretCleared,
}: Props) {
  const navigate = useNavigate();

  const openSandwichPage = () => {
    navigate("/sandwich_secret", {
      state: {
        mode: "encrypt",
        onSelect: onSecretSelected,
      },
    });
  };

  if (!selectedSecret) {
    return (
      <div style={{ marginTop: 20 }}>
        <button
          onClick={openSandwichPage}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            backgroundColor: "#C99700",
            borderRadius: "10px",
            border: "none",
            color: "black",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20 }}>🧩</span>
          <span>Seleziona file segreto (Sandwich)</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, textAlign: "center" }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#C99700",
          marginBottom: 20,
        }}
      >
        Contenuto selezionato: {selectedSecret.type}
      </div>

      <button
        onClick={onSecretCleared}
        style={{
          padding: "12px 16px",
          backgroundColor: "#C99700",
          borderRadius: "10px",
          border: "none",
          color: "black",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Cambia file segreto
      </button>
    </div>
  );
}
