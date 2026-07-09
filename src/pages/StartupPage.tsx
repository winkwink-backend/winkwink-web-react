import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StorageService } from "../services/StorageService";
import { useTranslation } from "react-i18next";

export const StartupPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // ⭐ Avvia solo il flusso, senza creare cartelle
    const startFlow = async () => {
      await runStartupFlow();
    };

    startFlow();
  }, []);

  const runStartupFlow = async () => {
    // ⭐ 1️⃣ Bypass SOLO per ACCETTA (prima notifica)
    const bypass = StorageService.getBypassLockSync();


    if (bypass) {
      await StorageService.setBypassLock(false);
      navigate("/download-center", { replace: true });
      return;
    }

    // ⭐ 2️⃣ Flusso normale: login → passwordGate
    const loggedIn = await StorageService.isLoggedIn();

    if (!loggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    navigate("/passwordGate", { replace: true });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div className="loader" />
      <div style={{ marginTop: 16, fontSize: 16, textAlign: "center" }}>
        {t("startupLoading")}
      </div>
    </div>
  );
};
