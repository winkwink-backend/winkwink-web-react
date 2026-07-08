// src/pages/AliasRequestPage.tsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { ApiService } from "../services/ApiService";
import { AppState } from "../services/AppState";
import { StorageService } from "../services/StorageService";
import { NotificationService } from "../services/NotificationService";

import { aliasContactFromJson } from "../models/AliasContact";


import "./AliasRequestPage.css";

export default function AliasRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = React.useContext(ColorProviderContext);

  const request = location.state?.request;
  const alias = request?.alias || "";
  const profileImage = request?.profileImageUrl || "";

  const fromAlias = alias;
  const toAlias = AppState.myAlias;

  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // ACCEPT REQUEST
  // ------------------------------------------------------------
  async function accept() {
    setLoading(true);

    const res = await ApiService.post("/alias/accept", {
      fromAlias,
      toAlias,
    });

    if (res.success) {
      NotificationService.instance.removeNotification(request);

      const contacts = await ApiService.getAliasContacts();

      AppState.aliasContacts = contacts.map((c: any) => {
        return aliasContactFromJson({
          alias: c.alias,
          profileImageUrl: c.profileImageUrl || "",
          userId: String(c.userId),
          peerId: String(c.peerId),
          publicKey: c.publicKey,
          version: c.version,
        });
      });

      await StorageService.saveAliasContacts(AppState.aliasContacts);

      navigate(-1);
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // REJECT REQUEST
  // ------------------------------------------------------------
  async function reject() {
    setLoading(true);

    await ApiService.post("/alias/reject", {
      fromAlias,
      toAlias,
    });

    NotificationService.instance.removeNotification(request);

    navigate(-1);
    setLoading(false);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div className="arp-container">
        <div className="arp-avatar">
          {profileImage ? (
            <img src={profileImage} alt="avatar" />
          ) : (
            <div className="arp-placeholder">👤</div>
          )}
        </div>

        <div className="arp-alias" style={{ color: theme?.text }}>
          {alias}
        </div>

        <div className="arp-subtitle" style={{ color: theme?.text + "B3" }}>
          Vuole aggiungerti ai contatti
        </div>

        <div className="arp-spacing" />

        {loading ? (
          <div className="arp-loading">Caricamento…</div>
        ) : (
          <>
            <button
              className="arp-btn arp-accept"
              onClick={accept}
            >
              ACCETTA
            </button>

            <div className="arp-spacing-small" />

            <button
              className="arp-btn arp-reject"
              onClick={reject}
            >
              RIFIUTA
            </button>
          </>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
