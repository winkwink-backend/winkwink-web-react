import React from "react";

type Props = {
  fileName: string;
  onFileNameChange: (value: string) => void;
  showSecretReadyBanner: boolean;
};

export default function EncryptHeader({
  fileName,
  onFileNameChange,
  showSecretReadyBanner,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* ⭐ Campo nome file */}
      <input
        type="text"
        value={fileName}
        onChange={(e) => onFileNameChange(e.target.value)}
        placeholder="Nome file"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      {/* ⭐ Banner “Segreto pronto” */}
      {showSecretReadyBanner && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#2e7d32",
            borderRadius: "12px",
            color: "white",
            textAlign: "center",
          }}
        >
          Il file segreto è pronto
        </div>
      )}
    </div>
  );
}
