import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CameraSecretPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode ?? "encrypt";
  const onSelect = location.state?.onSelect ?? (() => {});

  const [capturedImage, setCapturedImage] = useState<File | null>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressionRunning, setCompressionRunning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ⭐ Compressione intelligente (equivalente Flutter)
  async function compressIfNeeded(file: File): Promise<File> {
    const maxSize = 2 * 1024 * 1024; // 2 MB
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length <= maxSize) return file;
    if (compressionRunning) return file;

    setIsCompressing(true);
    setCompressProgress(0);
    setCompressionRunning(true);

    try {
      const bitmap = await createImageBitmap(file);

      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      // ⭐ Simulazione avanzamento come Flutter
      for (let i = 0; i <= 100; i += 8) {
        await new Promise((r) => setTimeout(r, 30));
        setCompressProgress(i);
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.8)
      );

      if (!blob) return file;

      return new File([await blob.arrayBuffer()], "compressed.jpg", {
        type: "image/jpeg",
      });
    } finally {
      setIsCompressing(false);
      setCompressionRunning(false);
    }
  }

  // ⭐ Scatta foto (web equivalent)
  const takePhoto = () => {
    if (compressionRunning) return;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const optimized = await compressIfNeeded(file);
    setCapturedImage(optimized);
  };

  const deletePhoto = () => setCapturedImage(null);

  const confirm = async () => {
    if (!capturedImage) return;

    const buffer = await capturedImage.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    onSelect({
      type: "image",
      payload: bytes,
      mode,
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
      <h2 style={{ textAlign: "center" }}>Scatta una foto</h2>
      <p style={{ textAlign: "center" }}>
        Usa la fotocamera per creare un contenuto segreto
      </p>

      {/* ⭐ Pulsante scatta foto */}
      <button
        onClick={takePhoto}
        className="wink-button"
        style={{ marginTop: 30 }}
      >
        📷 Scatta foto
      </button>

      {/* ⭐ Input nascosto */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handlePhotoSelected}
      />

      {/* ⭐ Preview */}
      {capturedImage && (
        <>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="preview"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button
              onClick={deletePhoto}
              style={{
                background: "none",
                border: "none",
                color: "red",
                fontSize: 32,
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          </div>

          <button
            onClick={confirm}
            className="wink-button"
            style={{ marginTop: 20 }}
          >
            ✔ Conferma
          </button>
        </>
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
              Elaborazione foto…
            </div>
            <progress
              value={compressProgress / 100}
              max={1}
              style={{ width: 200, marginTop: 20 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
