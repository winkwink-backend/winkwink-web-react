import React, { useRef } from "react";

type Props = {
  visibleImage: File | null;
  onImageSelected: (file: File) => void;
};

export default function EncryptVisibleImage({
  visibleImage,
  onImageSelected,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pickImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* ⭐ Pulsante stile MiniNeonButton */}
      <button
        onClick={pickImage}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          backgroundColor: "#C99700",
          borderRadius: "10px",
          border: "none",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 20 }}>🖼️</span>
        <span>Seleziona immagine visibile</span>
      </button>

      {/* ⭐ Input file nascosto */}
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ⭐ Preview immagine */}
      {visibleImage && (
        <div style={{ marginTop: 20 }}>
          <img
            src={URL.createObjectURL(visibleImage)}
            alt="preview"
            style={{
              width: 120,
              height: 120,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </div>
  );
}
