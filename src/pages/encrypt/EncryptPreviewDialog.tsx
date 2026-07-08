import React from "react";
import { createRoot } from "react-dom/client";

export function showEncryptPreviewDialog(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    // ⭐ Creiamo un nodo DOM per il modal
    const modalRoot = document.createElement("div");
    document.body.appendChild(modalRoot);

    // ⭐ Creiamo la root React 18
    const root = createRoot(modalRoot);

    const close = (result: boolean) => {
      // ⭐ React 18: unmount corretto
      root.unmount();

      // ⭐ Rimuoviamo il nodo dal DOM
      modalRoot.remove();

      resolve(result);
    };

    const Modal = () => (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "#222",
            padding: 20,
            borderRadius: 12,
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              borderRadius: 8,
              marginBottom: 20,
            }}
          />

          <button
            className="wink-button"
            onClick={() => close(true)}
            style={{ marginRight: 10 }}
          >
            ✔ Conferma
          </button>

          <button
            className="wink-button"
            onClick={() => close(false)}
            style={{ backgroundColor: "#444" }}
          >
            ✖ Annulla
          </button>
        </div>
      </div>
    );

    // ⭐ React 18: render corretto
    root.render(<Modal />);
  });
}
