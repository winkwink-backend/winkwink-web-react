import React from "react";
import { createRoot } from "react-dom/client";

type DialogProps = {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  error?: boolean;
};

function Dialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText,
  error = false,
}: DialogProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: error ? "#1a1a1a" : "white",
          padding: 20,
          borderRadius: 8,
          width: "80%",
          maxWidth: 360,
          color: error ? "white" : "black",
        }}
      >
        <h3 style={{ marginTop: 0, color: error ? "red" : "black" }}>
          {title}
        </h3>

        <p style={{ marginBottom: 20 }}>{message}</p>

        <div
          style={{
            display: "flex",
            justifyContent: cancelText ? "space-between" : "flex-end",
          }}
        >
          {cancelText && (
            <button
              onClick={onCancel}
              style={{
                background: "transparent",
                border: "none",
                color: error ? "white" : "#1976d2",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={onConfirm}
            style={{
              background: "transparent",
              border: "none",
              color: error ? "white" : "#1976d2",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 🔥 EXIT DIALOG (equivalente Flutter)
// ------------------------------------------------------------
export function showExitDialog({
  title,
  message,
}: {
  title: string;
  message: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    const close = () => {
      root.unmount();
      div.remove();
    };

    root.render(
      <Dialog
        title={title}
        message={message}
        cancelText="Annulla"
        confirmText="Esci"
        onCancel={() => {
          close();
          resolve(false);
        }}
        onConfirm={() => {
          close();
          resolve(true);
          window.close(); // equivalente più vicino a SystemNavigator.pop()
        }}
      />
    );
  });
}

// ------------------------------------------------------------
// 🔥 INFO DIALOG
// ------------------------------------------------------------
export function showInfoDialog({
  title,
  message,
}: {
  title: string;
  message: string;
}): Promise<void> {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    const close = () => {
      root.unmount();
      div.remove();
      resolve();
    };

    root.render(
      <Dialog
        title={title}
        message={message}
        confirmText="OK"
        onConfirm={close}
      />
    );
  });
}

// ------------------------------------------------------------
// 🔥 ERROR DIALOG
// ------------------------------------------------------------
export function showErrorDialog({
  title,
  message,
}: {
  title: string;
  message: string;
}): Promise<void> {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    const close = () => {
      root.unmount();
      div.remove();
      resolve();
    };

    root.render(
      <Dialog
        title={title}
        message={message}
        error={true}
        confirmText="OK"
        onConfirm={close}
      />
    );
  });
}
