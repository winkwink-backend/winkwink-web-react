// src/pages/PasswordGatePage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";

import { StorageService } from "../services/StorageService";
import { ApiService } from "../services/ApiService";
import { ContactSyncService } from "../services/ContactSyncService";
import { PresenceService } from "../services/PresenceService";
import { SignalingService } from "../services/SignalingService";
import { AppState } from "../services/AppState";

import { showExitDialog, showErrorDialog, showInfoDialog } from "../utils/dialogs";
import { AppRoutes } from "../routes/AppRoutes";

export default function PasswordGatePage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // UPDATE FCM TOKEN (web)
  // ------------------------------------------------------------
  async function updateFcmTokenOnServer(userId: number) {
    try {
      const fcmToken = await StorageService.loadString("fcm_token");
      if (!fcmToken) return;

      await fetch(
        "https://winkwink-backend1-production.up.railway.app/update_fcm_token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token: fcmToken }),
        }
      );
    } catch (e) {
      console.error("Errore sincronizzazione token FCM:", e);
    }
  }

  // ------------------------------------------------------------
  // CHECK PASSWORD
  // ------------------------------------------------------------
  async function checkPassword() {
    setLoading(true);
    setError(null);

    try {
      // 1) Recupera password locale
      const profileLocal = await StorageService.getProfile();
      const saved = profileLocal.password;

      if (!saved) {
        setLoading(false);
        setError("Nessuna password trovata. Riesegui il login.");
        return;
      }

      // 2) Controllo password
      if (password.trim() !== saved) {
        setLoading(false);
        setError("Password errata");
        return;
      }

      // 3) Recupero profilo server
      try {
        const profileServer = await ApiService.getMyProfile();
        if (profileServer) {
          await StorageService.saveUserId(profileServer.id);
          await StorageService.savePhone(profileServer.phone);
          await StorageService.saveName(profileServer.firstName);
          await StorageService.saveLastName(profileServer.lastName);
        }
      } catch (e) {
        console.error("Recupero profilo server fallito:", e);
      }

      // 4) Sincronizzazione contatti
      try {
        const sync = await ContactSyncService.syncContacts();

        AppState.allContacts = sync.allContacts;

        AppState.wwContacts = sync.wwContacts.map((c) => ({
          ...c,
          userId: c.userId?.toString(),
          peerId: c.peerId?.toString(),
          publicKey: c.publicKey ?? "",
          version: c.version ?? 1,
        }));

        AppState.chats = sync.chats;
        AppState.initialized = true;

        for (const c of AppState.wwContacts) {
          await StorageService.saveOrUpdateWWContact(c);
        }
      } catch (e) {
        console.error("Errore sync contatti:", e);
      }

      // 5) Imposta currentUser + PresenceService + FCM
      try {
        const userId = await StorageService.getUserId();
        if (userId) {
          const profile = await StorageService.getProfile();

          AppState.currentUser = {
            id: userId,
            phone: profile.phone,
            name: profile.name,
            lastName: profile.lastName,
          };

          PresenceService.instance.init();
          await updateFcmTokenOnServer(userId);
        }
      } catch (e) {
        console.error("Errore impostazione currentUser/presence/FCM:", e);
      }

      // 6) Socket connect
      try {
        const uid = AppState.currentUser?.id;
        if (uid) {
          SignalingService.instance.connect(uid);
        }
      } catch (e) {
        console.error("Errore connessione socket:", e);
      }

      // 7) Vai alla Home
      navigate(AppRoutes.home);
    } catch (e) {
      setError("Errore imprevisto: " + e);
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      showColorSelector={false}
      header={
        <div style={{ padding: "12px", textAlign: "center" }}>
          <h2 style={{ color: "white" }}>Password Gate</h2>
        </div>
      }
    >
      <div style={{ padding: "24px", color: "white" }}>
        <p style={{ textAlign: "center", color: "white70" }}>
          Inserisci la tua password per accedere
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          placeholder="Password"
          style={{ marginTop: "32px" }}
        />

        {error && (
          <p style={{ color: "red", marginTop: "12px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: "32px" }}>
          {loading ? (
            <div style={{ textAlign: "center" }}>
              <div className="loader"></div>
            </div>
          ) : (
            <NeonButton label="Accedi" onClick={checkPassword} />
          )}
        </div>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            className="login-link"
            onClick={() => navigate(AppRoutes.passwordResetRequest)}
          >
            Password dimenticata?
          </button>
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
