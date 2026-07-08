// src/pages/encrypt/EncryptDownloadPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { StorageService } from "../services/StorageService";
import { AppState } from "../services/AppState";
import { wwContactEmpty } from "../models/WWContact";


import "./EncryptDownloadPage.css";

export default function EncryptDownloadPage() {
  const navigate = useNavigate();

  const [files, setFiles] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any[]>([]);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    loadFiles();
  }, []);

  // ------------------------------------------------------------
  // LOAD FILES (WEB VERSION)
  // ------------------------------------------------------------
  async function loadFiles() {
    const meta = await StorageService.getReceivedFiles();

    // meta = [
    //   {
    //     fileId: "IMG_1234.png",
    //     bytes: Uint8Array,
    //     senderId: "42",
    //     senderName: "Mario Rossi",
    //     timestamp: 1712345678901
    //   }
    // ]

    setFiles(meta);
    setMetadata(meta);
  }

  // ------------------------------------------------------------
  // GET METADATA FOR FILE
  // ------------------------------------------------------------
  function getInfoForFile(fileId: string) {
    const meta =
      metadata.find((m) => m.fileId === fileId) || {};

    if (!meta.fileId) {
      return {
        sender: "Sconosciuto",
        date: "--/--/---- --:--",
      };
    }

    let senderName = meta.senderName || "Sconosciuto";
    const senderId = meta.senderId?.toString();

    // lookup nei contatti WW
    if (senderName === "Sconosciuto" && senderId) {
      const contact =
        AppState.wwContacts.find(
          (c) => c.userId.toString() === senderId
        ) || wwContactEmpty()

      if (contact.userId) {
        senderName = `${contact.name} ${contact.lastName}`.trim();
      } else {
        senderName = senderId;
      }
    }

    let formattedDate = "--/--/---- --:--";
    if (meta.timestamp) {
      const dt = new Date(meta.timestamp);
      formattedDate = dt.toLocaleString("it-IT");
    }

    return {
      sender: senderName,
      date: formattedDate,
    };
  }

  // ------------------------------------------------------------
  // OPEN FILE → DecryptPage
  // ------------------------------------------------------------
  function openFile(file: any) {
    navigate("/decrypt", {
      state: {
        bytes: file.bytes,
        fileName: file.fileId,
      },
    });
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div className="edp-container">
        <h2 className="edp-title">File Pervenuti</h2>

        {files.length === 0 ? (
          <div className="edp-empty">Nessun file pervenuto</div>
        ) : (
          <div className="edp-list">
            {files.map((file, i) => {
              const info = getInfoForFile(file.fileId);

              return (
                <div
                  key={i}
                  className="edp-item"
                  onClick={() => openFile(file)}
                >
                  <div className="edp-name">{file.fileId}</div>

                  <div className="edp-meta">
                    <div>Da: {info.sender}</div>
                    <div>Arrivato: {info.date}</div>
                  </div>

                  <div className="edp-icon">🔓</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
