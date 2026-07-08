// src/pages/password/PasswordResetRequestPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";
import { useColorProvider } from "../providers/ColorProvider";


import { AppConfig } from "../config/AppConfig";

import "./PasswordResetRequestPage.css";

export default function PasswordResetRequestPage() {
  const navigate = useNavigate();
  const theme = useColorProvider();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // SEND OTP
  // ------------------------------------------------------------
  async function sendOtp() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${AppConfig.baseUrl}/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        setError(data.error || "Errore");
      } else {
        navigate("/password-reset-verify", {
          state: { email: email.trim() },
        });
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
      appBarTitle="Recupero password"
      showColorSelector={false}
      dark
    >
      <div className="prr-container">
        <div className="prr-label" style={{ color: theme.text }}>
          Inserisci la tua email per ricevere il codice OTP
        </div>

        {/* EMAIL FIELD */}
        <input
          type="email"
          className="prr-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ color: theme.text }}
        />

        {/* ERROR */}
        {error && (
          <div className="prr-error">
            {error}
          </div>
        )}

        {/* BUTTON */}
        <div className="prr-button">
          <NeonButton
            label={loading ? "..." : "Invia codice"}
            onClick={loading ? undefined : sendOtp}
          />
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
