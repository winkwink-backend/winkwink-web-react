// src/pages/chat/AttachmentPanel.tsx

import React, { useRef } from "react";
import { ChatSignalingService } from "../services/ChatSignalingService";
import { UploadService } from "../services/UploadService";

import "./AttachmentPanel.css";

type Props = {
  chatId: number;
  userId: number;
  onClose: () => void;
};

export default function AttachmentPanel({ chatId, userId, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------------------------------------
  // PICK IMAGE
  // ------------------------------------------------------------
  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await UploadService.uploadFile(file);
      if (!url) {
        alert("Impossibile caricare l'immagine");
        return;
      }

      ChatSignalingService.instance.sendFileMessage(
        chatId,
        userId,
        url,
        "image"
      );
    } catch (err) {
      console.error("Errore invio immagine:", err);
      alert("Errore durante l'invio dell'immagine");
    }

    onClose();
  }

  // ------------------------------------------------------------
  // PICK VIDEO
  // ------------------------------------------------------------
  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await UploadService.uploadFile(file);
      if (!url) {
        alert("Impossibile caricare il video");
        return;
      }

      ChatSignalingService.instance.sendFileMessage(
        chatId,
        userId,
        url,
        "video"
      );
    } catch (err) {
      console.error("Errore invio video:", err);
      alert("Errore durante l'invio del video");
    }

    onClose();
  }

  // ------------------------------------------------------------
  // PICK FILE
  // ------------------------------------------------------------
  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await UploadService.uploadFile(file);
      if (!url) {
        alert("Impossibile caricare il file");
        return;
      }

      ChatSignalingService.instance.sendFileMessage(
        chatId,
        userId,
        url,
        "file"
      );
    } catch (err) {
      console.error("Errore invio file:", err);
      alert("Errore durante l'invio del file");
    }

    onClose();
  }

  return (
    <div className="attachment-panel">
      <div className="attachment-content">
        <div className="attachment-grid">
          <AttachmentButton
            icon="🖼️"
            label="Foto"
            onClick={() => imageInputRef.current?.click()}
          />

          <AttachmentButton
            icon="🎥"
            label="Video"
            onClick={() => videoInputRef.current?.click()}
          />

          <AttachmentButton
            icon="📄"
            label="File"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: "none" }}
        onChange={pickImage}
      />

      <input
        type="file"
        accept="video/*"
        ref={videoInputRef}
        style={{ display: "none" }}
        onChange={pickVideo}
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={pickFile}
      />
    </div>
  );
}

// ------------------------------------------------------------
// BUTTON COMPONENT
// ------------------------------------------------------------
function AttachmentButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="attachment-item" onClick={onClick}>
      <div className="attachment-icon">{icon}</div>
      <div className="attachment-label">{label}</div>
    </div>
  );
}
