// src/pages/legal/LegalPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../../widgets/WinkWinkScaffold";
import NeonButton from "../../widgets/NeonButton";

import { KeyService } from "../../services/KeyService";

import "./LegalPage.css";

export default function LegalPage() {
  const navigate = useNavigate();

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [legalText, setLegalText] = useState("");

  // ------------------------------------------------------------
  // LOAD LEGAL TEXT (WEB)
  // ------------------------------------------------------------
  useEffect(() => {
    (async () => {
      const res = await fetch("/assets/legal/legal_it.json");
      const json = await res.json();
      setLegalText(json.legal_text || "");
    })();
  }, []);

  // ------------------------------------------------------------
  // ACCEPT
  // ------------------------------------------------------------
  async function onAccept() {
    if (!accepted) return;

    setLoading(true);

    // 1️⃣ Sul web NON esistono permessi contatti → skip

    // 2️⃣ Genera chiavi ECC
    await KeyService.instance.generateKeys();

    // 3️⃣ Vai in Home
    navigate("/home");
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
 return (
  <WinkWinkScaffold
    appBarTitle="Informativa"
    showColorSelector={false}
  >
    <div className="legal-container">
      {/* LEGAL TEXT */}
      <div className="legal-text-box">
        <div className="legal-text">{legalText}</div>
      </div>

      {/* ACCEPT CHECKBOX */}
      <div className="legal-checkbox-row">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span className="legal-checkbox-label">
          Accetto l’informativa e autorizzo l’uso dei miei dati
        </span>
      </div>

      {/* BUTTON */}
      {loading ? (
        <div className="legal-loading">Caricamento…</div>
      ) : (
        <NeonButton
          label="Accetta"
          onClick={accepted ? onAccept : undefined}
        />
      )}
    </div>
  </WinkWinkScaffold>
);

}
