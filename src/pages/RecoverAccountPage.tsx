// src/pages/recover/RecoverAccountPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";

import { ApiService } from "../services/ApiService";
import { StorageService } from "../services/StorageService";

import "./RecoverAccountPage.css";

export default function RecoverAccountPage() {
  const navigate = useNavigate();

  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ------------------------------------------------------------
  // PICK PNG FILE (WEB)
  // ------------------------------------------------------------
  function pickKeyFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const bytes = new Uint8Array(await file.arrayBuffer());
      setFileBytes(bytes);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    };

    input.click();
  }

  // ------------------------------------------------------------
  // SUBMIT
  // ------------------------------------------------------------
  async function submit() {
    if (!fileBytes) {
      alert("Nessun file selezionato");
      return;
    }

    const response = await ApiService.recoverWithKey(fileBytes);

    if (!response || response.error) {
      alert("Recupero fallito");
      return;
    }

    const user = response.user;
    const authToken = response.authToken;

    await StorageService.saveAuthToken(authToken);
    await StorageService.saveUserId(user.id);
    await StorageService.saveAlias(user.alias);

    await StorageService.saveProfile({
      id: user.id,
      alias: user.alias,
      phone: user.phone,
      name: user.name,
      surname: user.last_name,
      email: user.email,
      password: user.password,
      qrData: "",
    });


    await StorageService.setHasPassword(true);
    await StorageService.setLoggedIn(true);

    navigate("/passwordGate", { replace: true });
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      appBarTitle="Recupero Account"
      showColorSelector={false}
      dark
    >
      <div className="rap-container">
        <div className="rap-instructions">
          Seleziona la chiave PNG per recuperare il tuo profilo
        </div>

        <NeonButton label="Seleziona chiave" onClick={pickKeyFile} />

        {previewUrl && (
          <div className="rap-preview-box">
            <img src={previewUrl} alt="key" className="rap-preview-img" />
            <div className="rap-preview-text">Chiave selezionata</div>
          </div>
        )}

        <div className="rap-bottom">
          <NeonButton label="Recupera profilo" onClick={submit} />
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
