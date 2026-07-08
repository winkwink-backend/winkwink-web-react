// src/pages/decrypt/DecryptPage.tsx

import React, { useState } from "react";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";

import { DecryptLogic } from "../services/DecryptLogic";
import type { DecryptedFile } from "../models/DecryptedFile";

import "./DecryptPage.css";

export default function DecryptPage() {
  const decrypt = new DecryptLogic();

  const [selectedBytes, setSelectedBytes] = useState<Uint8Array | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [visibleImage, setVisibleImage] = useState<Uint8Array | null>(null);
  const [decryptedFiles, setDecryptedFiles] = useState<DecryptedFile[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // ------------------------------------------------------------
  // PICK PNG (WEB)
  // ------------------------------------------------------------
  async function pickPngWeb() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const bytes = new Uint8Array(await file.arrayBuffer());

      setSelectedBytes(bytes);
      setSelectedName(file.name);
      setVisibleImage(null);
      setDecryptedFiles([]);

      // meta info
      const meta = await decrypt.loadKmsgForBytes(bytes);
      console.log("messageId:", meta.messageId);
      console.log("kmsg:", meta.kmsgBase64);
    };

    input.click();
  }

  // ------------------------------------------------------------
  // DECRYPT FILE
  // ------------------------------------------------------------
  async function decryptFile() {
    if (!selectedBytes) {
      alert("Nessun file selezionato");
      return;
    }

    try {
      setIsDecrypting(true);

      const result = await decrypt.decryptBytes(selectedBytes);

      setVisibleImage(result.coverImage);
      setDecryptedFiles(result.files);
    } catch (e) {
      alert("Errore: " + e);
    } finally {
      setIsDecrypting(false);
    }
  }

  // ------------------------------------------------------------
  // FULLSCREEN IMAGE
  // ------------------------------------------------------------
  function openImageFullscreen(bytes: Uint8Array) {
    const cleanBytes = new Uint8Array(bytes);
    const url = URL.createObjectURL(new Blob([cleanBytes]));
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<img src="${url}" style="width:100%;height:auto;background:black;">`);
    }
  }

  // ------------------------------------------------------------
  // FULLSCREEN VIDEO
  // ------------------------------------------------------------
  function openVideoFullscreen(bytes: Uint8Array) {
    const normalized = bytes.slice();
    const url = URL.createObjectURL(new Blob([normalized], { type: "video/mp4" }));


    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`
        <video src="${url}" controls autoplay style="width:100%;height:auto;background:black;"></video>
      `);
    }
  }

  // ------------------------------------------------------------
  // INLINE VIDEO
  // ------------------------------------------------------------
  function InlineVideo({ bytes }: { bytes: Uint8Array }) {
    const normalized = new Uint8Array(bytes);
    const blob = new Blob([normalized], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    return (
      <video
        src={url}
        controls
        style={{ width: "100%", borderRadius: 12 }}
      />
    );
  }


  // ------------------------------------------------------------
  // INLINE AUDIO
  // ------------------------------------------------------------
  function InlineAudio({ bytes }: { bytes: Uint8Array }) {
    const normalized = new Uint8Array(bytes);
    const blob = new Blob([normalized], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);

    return (
      <audio controls style={{ width: "100%" }}>
       <source src={url} type="audio/mp3" />
      </audio>
    );
  }

  // ------------------------------------------------------------
  // FILE WIDGET
  // ------------------------------------------------------------
  function buildFileWidget(file: DecryptedFile) {
    switch (file.type) {
      case "image":
        return (
          <div
            className="dec-image"
            onClick={() => openImageFullscreen(file.bytes)}
          >
            <img
               src={URL.createObjectURL(
                 new Blob([new Uint8Array(file.bytes)], { type: "image/png" })
                )}
               alt="hidden"
               style={{ width: "100%", borderRadius: 12 }}
            />
          </div>
        );

      case "video":
        return (
          <div onClick={() => openVideoFullscreen(file.bytes)}>
            <InlineVideo bytes={file.bytes} />
          </div>
        );

      case "audio":
        return (
          <div>
            <InlineAudio bytes={file.bytes} />
          </div>
        );

      case "text":
        return (
          <div
            className="dec-text"
            onClick={() => {
              const text = new TextDecoder().decode(file.bytes);
              alert(text);
            }}
          >
            Testo nascosto (clicca per aprire)
          </div>
        );

      default:
        return null;
    }
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      appBarTitle="Decrypt"
      showColorSelector={false}
    >
      <div className="dec-container">
        <NeonButton label="Galleria WinkWink" onClick={pickPngWeb} />

        {/* FILE SELEZIONATO */}
        {selectedBytes && (
          <>
            <div className="dec-section-title">File selezionato:</div>

            <img
              src={URL.createObjectURL(new Blob([selectedBytes as BlobPart]))}
              alt="selected"
              className="dec-selected-img"
            />

            <NeonButton
              label="Cancella"
              onClick={() => {
                setSelectedBytes(null);
                setSelectedName("");
                setVisibleImage(null);
                setDecryptedFiles([]);
              }}
            />

            <NeonButton label="Decripta" onClick={decryptFile} />
          </>
        )}

        {/* IMMAGINE VISIBILE */}
        {visibleImage && (
          <>
            <div className="dec-section-title">Immagine visibile:</div>
            <img
              src={URL.createObjectURL(new Blob([visibleImage as BlobPart]))}
              alt="visible"
              className="dec-visible-img"
              onClick={() => openImageFullscreen(visibleImage)}
            />
          </>
        )}

        {/* FILE DECRIPTATI */}
        {decryptedFiles.length > 0 && (
          <div className="dec-files-box">
            <div className="dec-files-header">
              <span>File segreti</span>
              <button
                className="dec-close-btn"
                onClick={() => setDecryptedFiles([])}
              >
                ✖
              </button>
            </div>

            {decryptedFiles.map((f, i) => (
              <div key={i} className="dec-file-item">
                {buildFileWidget(f)}
              </div>
            ))}
          </div>
        )}

        {/* OVERLAY */}
        {isDecrypting && (
          <div className="dec-overlay">
            <div className="dec-loader"></div>
          </div>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
