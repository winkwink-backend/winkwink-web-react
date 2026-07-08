// src/pages/chat/PdfViewerPage.tsx

import React, { useEffect, useState } from "react";
import "./PdfViewerPage.css";

type Props = {
  url: string;
  fileName: string;
};

export default function PdfViewerPage({ url, fileName }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // DOWNLOAD PDF IN MEMORY
  // ------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Errore download PDF");

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        setBlobUrl(objectUrl);
        setLoading(false);
      } catch (e) {
        console.error("Errore visualizzazione PDF:", e);
        setLoading(false);
      }
    })();
  }, [url]);

  // ------------------------------------------------------------
  // DOWNLOAD FILE (browser)
  // ------------------------------------------------------------
  function downloadPdf() {
    if (!blobUrl) return;

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.click();
  }

  return (
    <div className="pdf-container">
      <div className="pdf-header">
        <span className="pdf-title">{fileName}</span>

        {!loading && (
          <button className="pdf-download-btn" onClick={downloadPdf}>
            ⬇️ Scarica
          </button>
        )}
      </div>

      <div className="pdf-body">
        {loading ? (
          <div className="pdf-loading">Caricamento…</div>
        ) : blobUrl ? (
          <iframe
            src={blobUrl}
            title={fileName}
            className="pdf-frame"
          />
        ) : (
          <div className="pdf-error">Impossibile visualizzare il PDF</div>
        )}
      </div>
    </div>
  );
}
