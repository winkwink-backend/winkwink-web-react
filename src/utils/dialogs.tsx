// src/utils/dialogs.tsx

import React from "react";
import { createRoot } from "react-dom/client";   // ✔ React 18 API

type DialogProps = {
  title: string;
  message: string;
  actions: React.ReactNode;
  close?: (value: boolean) => void;   // ⭐ aggiunto
};


function Dialog({ title, message, actions, close  }: DialogProps): React.JSX.Element {
  return (
    <div className="wink-dialog-overlay">
      <div className="wink-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="wink-dialog-actions">{actions}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// ⭐ UTILITY PER MOSTRARE DIALOGHI (React 18)
// ------------------------------------------------------------
function showDialogElement(
  element: React.ReactElement<any>
): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const close = (value: boolean) => {
      root.unmount();
      container.remove();
      resolve(value);
    };

    root.render(
      React.cloneElement(element, { close })
    );
  });
}


// ------------------------------------------------------------
// ⭐ EXIT DIALOG
// ------------------------------------------------------------
export async function showExitDialog(): Promise<boolean> {
  return showDialogElement(<ExitDialog />);
}

function ExitDialog({ close }: { close?: (v: boolean) => void }) {
  return (
    <Dialog
      title="Vuoi uscire?"
      message="Confermi di voler chiudere l'app?"
      actions={
        <>
          <button onClick={() => close?.(false)}>Annulla</button>
          <button
            onClick={() => {
              close?.(true);
              setTimeout(() => window.close(), 50);
            }}
          >
            OK
          </button>
        </>
      }
    />
  );
}

// ------------------------------------------------------------
// ⭐ INFO DIALOG
// ------------------------------------------------------------
export async function showInfoDialog(title: string, message: string) {
  return showDialogElement(
    <Dialog
      title={title}
      message={message}
      actions={<button onClick={(e) => e.stopPropagation()}>OK</button>}
    />
  );
}


// ------------------------------------------------------------
// ⭐ ERROR DIALOG
// ------------------------------------------------------------
export async function showErrorDialog(title: string, message: string) {
  return showDialogElement(
    <Dialog
      title={title}
      message={message}
      actions={<button onClick={(e) => e.stopPropagation()}>OK</button>}
    />
  );
}

