import React from "react";
import ReactDOM from "react-dom";

type Props = {
  payloadSize: number;
  capacity: number;
  visibleImage: File | null;
};

export function showEncryptPreviewDialog({
  payloadSize,
  capacity,
  visibleImage,
}: Props): Promise<boolean> {
  return new Promise((resolve) => {
    const modalRoot = document.createElement("div");
    document.body.appendChild(modalRoot);

    const close = (result: boolean) => {
      ReactDOM.unmountComponentAtNode(modalRoot);
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
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            width: 300,
          }}
        >
          <h3>Anteprima cifratura</h3>

          <div style={{ marginTop: 10 }}>
            <div>
              Dimensione payload: {Math.floor(payloadSize / 1024)} KB
            </div>
            <div>
              Capacità immagine: {Math.floor(capacity / 1024)} KB
            </div>

            {visibleImage && (
              <img
                src={URL.createObjectURL(visibleImage)}
                alt="preview"
                style={{
                  marginTop: 10,
                  height: 80,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              onClick={() => close(false)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#ccc",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Annulla
            </button>

            <button
              onClick={() => close(true)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#C99700",
                color: "white",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Procedi
            </button>
          </div>
        </div>
      </div>
    );

    ReactDOM.render(<Modal />, modalRoot);
  });
}
