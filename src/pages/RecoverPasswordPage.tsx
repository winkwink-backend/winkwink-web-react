// src/pages/recover/RecoverPasswordPage.tsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ColorProviderContext } from "../providers/ColorProvider";
import { StorageService } from "../services/StorageService";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { useTranslation } from "react-i18next";

export const RecoverPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useContext(ColorProviderContext);

  const navigate = useNavigate();

  const resetApp = async () => {
    const confirm = window.confirm(
      t("resetAppMessage") // equivalente del dialog Flutter
    );

    if (!confirm) return;

    // 🔥 Cancella TUTTI i dati locali
    await StorageService.clearAll();

    // 🔥 Torna alla LoginPage
    navigate("/login", { replace: true });
  };

  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
          }}
        >
          {/* 🔥 TITOLO NEON */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: theme?.text,
              textAlign: "center",
              textShadow: "1px 1px 4px black",
            }}
          >
            {t("recoverPasswordTitle")}
          </h1>

          <div style={{ height: 20 }} />

          {/* 🔥 DESCRIZIONE MULTILINGUA */}
          <p
            style={{
              fontSize: 16,
              color: "#000000d9",
              textAlign: "center",
              maxWidth: 400,
            }}
          >
            {t("recoverPasswordDescription")}
          </p>

          <div style={{ height: 40 }} />

          {/* 🔥 PULSANTE RESET */}
          <button
            onClick={resetApp}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "14px 40px",
              borderRadius: 14,
              border: "none",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {t("resetAppButton")}
          </button>
        </div>
      </div>
    </WinkWinkScaffold>
  );
};
