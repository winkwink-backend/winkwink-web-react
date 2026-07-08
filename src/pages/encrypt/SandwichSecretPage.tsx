import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SandwichSecretPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const onSelect = location.state?.onSelect ?? (() => {});
  const mode = location.state?.mode ?? "sandwich";

  const [sandwich, setSandwich] = useState<Array<any>>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);

  const maxSandwichSize = 5 * 1024 * 1024; // 5 MB

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ⭐ Calcolo peso totale
  const getTotalSize = () =>
    sandwich.reduce((sum, item) => sum + item.size, 0);

  // ⭐ Barra di avanzamento
  const getProgress = () => getTotalSize() / maxSandwichSize;

  // ⭐ Compressione intelligente (solo immagini)
  async function compressIfNeeded(file: File): Promise<Uint8Array> {
    const maxSize = 2 * 1024 * 1024;

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length <= maxSize) return bytes;

    // ⭐ Compressione lato web → ridimensionamento via canvas
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );

    if (!blob) return bytes;

    const compressedBuffer = await blob.arrayBuffer();
    return new Uint8Array(compressedBuffer);
  }

  // ⭐ Multi-selezione immagini
  const pickMultipleImages = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsCompressing(true);
    setCompressProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const optimized = await compressIfNeeded(file);

      if (getTotalSize() + optimized.length > maxSandwichSize) {
        alert("Limite sandwich superato");
        break;
      }

      setSandwich((prev) => [
        ...prev,
        {
          type: "image",
          data: optimized,
          size: optimized.length,
        },
      ]);

      setCompressProgress((i + 1) / files.length);
    }

    setIsCompressing(false);
  };

  // ⭐ Aggiungi da altre pagine (text, audio, camera)
  const addFromPage = (route: string, type: string) => {
    navigate(route, {
      state: {
        mode: "sandwich",
        onSelect: (result: any) => {
          const payload = result.payload;

          let size = 0;
          let data: Uint8Array | string;

          if (typeof payload === "string") {
            data = payload;
            size = payload.length;
          } else if (payload instanceof Uint8Array) {
            data = payload;
            size = payload.length;
          } else if (Array.isArray(payload)) {
            data = new Uint8Array(payload);
            size = data.length;
          } else {
            return;
          }

          if (getTotalSize() + size > maxSandwichSize) {
            alert("Limite sandwich superato");
            return;
          }

          const normalizedType = type === "camera" ? "image" : type;

          setSandwich((prev) => [
            ...prev,
            {
              type: normalizedType,
              data,
              size,
            },
          ]);
        },
      },
    });
  };

  // ⭐ Conferma → ritorna alla pagina Encrypt
  const confirmSandwich = () => {
    onSelect({
      type: "sandwich",
      payload: sandwich.map((e) => ({
        type: e.type,
        size: e.size,
        data: Array.from(e.data),
      })),
    });

    navigate(-1);
  };

  return (
    <div style={{ padding: 16 }}>
      {/* ⭐ Back */}
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

      {/* ⭐ Titolo */}
      <h2 style={{ textAlign: "center" }}>Sandwich Segreto</h2>
      <p style={{ textAlign: "center" }}>
        Aggiungi contenuti segreti da nascondere nel file
      </p>

      {/* ⭐ Progress bar */}
      <div style={{ marginTop: 20 }}>
        <progress value={getProgress()} max={1} style={{ width: "100%" }} />
        <div style={{ textAlign: "center", marginTop: 10 }}>
          {(getTotalSize() / (1024 * 1024)).toFixed(2)} MB / 5 MB
        </div>
      </div>

      {/* ⭐ Pulsanti */}
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={pickMultipleImages} className="wink-button">
          📸 Importa immagini
        </button>

        <button
          onClick={() => addFromPage("/camera_secret", "camera")}
          className="wink-button"
        >
          📷 Aggiungi da fotocamera
        </button>

        <button
          onClick={() => addFromPage("/text_secret", "text")}
          className="wink-button"
        >
          📝 Aggiungi testo
        </button>

        <button
          onClick={() => addFromPage("/audio_secret", "audio")}
          className="wink-button"
        >
          🎤 Aggiungi audio
        </button>
      </div>

      {/* ⭐ Input file nascosto */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFilesSelected}
      />

      {/* ⭐ Lista elementi */}
      {sandwich.length > 0 && (
        <div style={{ marginTop: 30 }}>
          {sandwich.map((item, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{item.type.toUpperCase()}</strong> —{" "}
                {(item.size / (1024 * 1024)).toFixed(2)} MB
              </div>

              <button
                onClick={() =>
                  setSandwich((prev) => prev.filter((_, i) => i !== index))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ Conferma */}
      {sandwich.length > 0 && (
        <button
          onClick={confirmSandwich}
          className="wink-button"
          style={{ marginTop: 30 }}
        >
          ✔ Conferma Sandwich
        </button>
      )}

      {/* ⭐ Overlay compressione */}
      {isCompressing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div style={{ textAlign: "center", color: "white" }}>
            <div className="loader"></div>
            <div style={{ marginTop: 20, fontSize: 18 }}>
              Elaborazione immagini…
            </div>
            <progress
              value={compressProgress}
              max={1}
              style={{ width: 200, marginTop: 20 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
