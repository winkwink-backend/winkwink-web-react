// src/pages/password/PasswordResetVerifyPage.tsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";
import { useColorProvider } from "../providers/ColorProvider";


import { AppConfig } from "../config/AppConfig";

import "./PasswordResetVerifyPage.css";

export default function PasswordResetVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useColorProvider();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // VERIFY OTP
  // ------------------------------------------------------------
  async function verifyOtp() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${AppConfig.baseUrl}/password-reset/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        setError(data.error || "Errore");
      } else {
        navigate("/password-reset-new-password", {
          state: { email },
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
      appBarTitle="Verifica OTP"
      showColorSelector={false}
      dark
    >
      <div className="prv-container">
        <div className="prv-label" style={{ color: theme.text }}>
          Inserisci il codice OTP ricevuto via email
        </div>

        {/* OTP FIELD */}
        <input
          type="text"
          className="prv-input"
          placeholder="Codice OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ color: theme.text }}
        />

        {/* ERROR */}
        {error && (
          <div className="prv-error">
            {error}
          </div>
        )}

        {/* BUTTON */}
        <div className="prv-button">
          <NeonButton
            label={loading ? "..." : "Verifica"}
            onClick={loading ? undefined : verifyOtp}
          />
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
