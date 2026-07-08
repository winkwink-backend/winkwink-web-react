// src/pages/password/PasswordResetNewPasswordPage.tsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";
import { ColorProviderContext } from "../providers/ColorProvider";

import { AppConfig } from "../config/AppConfig";

import "./PasswordResetNewPasswordPage.css";

export default function PasswordResetNewPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = React.useContext(ColorProviderContext) as { text: string };

  const email = location.state?.email;

  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // SAVE NEW PASSWORD
  // ------------------------------------------------------------
  async function saveNewPassword() {
    setError(null);

    if (pass.trim() !== confirm.trim()) {
      setError("Le password non coincidono");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${AppConfig.baseUrl}/password-reset/new-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pass.trim(),
        }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        setError(data.error || "Errore");
      } else {
        navigate("/login", { replace: true });
      }
    } catch (e) {
      setError("Errore di connessione");
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      appBarTitle="Nuova password"
      showColorSelector={false}
      dark
    >
      <div className="prnp-container">
        <div className="prnp-label" style={{ color: theme.text }}>
          Inserisci la nuova password
        </div>

        {/* PASSWORD */}
        <input
          type="password"
          className="prnp-input"
          placeholder="Nuova password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ color: theme.text }}
        />

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          className="prnp-input"
          placeholder="Conferma password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ color: theme.text }}
        />

        {/* ERROR */}
        {error && (
          <div className="prnp-error">
            {error}
          </div>
        )}

        {/* BUTTON */}
        <div className="prnp-button">
          <NeonButton
            label={loading ? "..." : "Salva password"}
            onClick={loading ? undefined : saveNewPassword}
          />
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
