// src/pages/AliasContactPage.tsx

import React, { useEffect, useState } from "react";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { ApiService } from "../services/ApiService";
import { StorageService } from "../services/StorageService";
import { AppState } from "../services/AppState";

import "./AliasContactPage.css";

type Props = {
  initialAlias?: string;
};

export default function AliasContactPage({ initialAlias }: Props) {
  const theme = React.useContext(ColorProviderContext);

  const [alias, setAlias] = useState(initialAlias || "");
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [foundUser, setFoundUser] = useState<any | null>(null);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    loadBlockedList();

    if (initialAlias && initialAlias.trim().length > 0) {
      searchAlias();
    }
  }, []);

  // ------------------------------------------------------------
  // LOAD BLOCKED LIST
  // ------------------------------------------------------------
  async function loadBlockedList() {
    const blocked = await ApiService.getBlockedList();
    if (alias.trim() && blocked.includes(alias.trim())) {
      setIsBlocked(true);
    }
  }

  // ------------------------------------------------------------
  // SEARCH ALIAS
  // ------------------------------------------------------------
  async function searchAlias() {
    const a = alias.trim();
    if (!a) return;

    setLoading(true);
    setFoundUser(null);
    setRequestSent(false);
    setIsBlocked(false);

    const res = await ApiService.get(`/alias/search?alias=${a}`);

    setLoading(false);
    setFoundUser(res.exists ? res : null);

    const blocked = await ApiService.getBlockedList();
    if (blocked.includes(a)) {
      setIsBlocked(true);
    }
  }

  // ------------------------------------------------------------
  // SEND REQUEST
  // ------------------------------------------------------------
  async function sendRequest() {
    if (!foundUser) return;

    const myAlias = AppState.myAlias;
    const toAlias = foundUser.alias;

    setLoading(true);

    const res = await ApiService.post("/alias/request", {
      fromAlias: myAlias,
      toAlias,
    });

    setLoading(false);
    setRequestSent(res.success === true);

    if (res.success) {
      alert(`Richiesta inviata a ${toAlias}`);
    }
  }

  // ------------------------------------------------------------
  // BLOCK USER
  // ------------------------------------------------------------
  async function blockUser() {
    if (!foundUser) return;

    const alias = foundUser.alias;
    const ok = await ApiService.blockAlias(alias);

    if (ok) {
      setIsBlocked(true);
      alert(`${alias} bloccato`);
    }
  }

  // ------------------------------------------------------------
  // UNBLOCK USER
  // ------------------------------------------------------------
  async function unblockUser() {
    if (!foundUser) return;

    const alias = foundUser.alias;
    const ok = await ApiService.unblockAlias(alias);

    if (ok) {
      setIsBlocked(false);
      alert(`${alias} sbloccato`);
    }
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div className="alias-container">
        <h2 className="alias-title">Cerca Alias</h2>

        {/* SEARCH FIELD */}
        <input
          className="alias-input"
          placeholder="Inserisci alias…"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchAlias()}
        />

        <div className="alias-spacing" />

        {/* LOADING */}
        {loading && <div className="alias-loading">Caricamento…</div>}

        {/* NOT FOUND */}
        {!loading && !foundUser && alias.trim() && (
          <div className="alias-notfound">Alias non trovato</div>
        )}

        {/* FOUND USER */}
        {!loading && foundUser && (
          <ProfileCard user={foundUser} theme={theme} />
        )}

        <div className="alias-spacing" />

        {/* SEND REQUEST */}
        {foundUser && !requestSent && !isBlocked && (
          <button
            className="alias-btn"
            style={{ background: theme?.primary, color: theme?.text }}
            onClick={sendRequest}
          >
            Invia richiesta
          </button>
        )}

        {/* REQUEST SENT */}
        {requestSent && (
          <div className="alias-sent">Richiesta inviata</div>
        )}

        <div className="alias-spacing" />

        {/* BLOCK / UNBLOCK */}
        {foundUser && (
          <button
            className="alias-btn"
            style={{
              background: isBlocked ? "green" : "red",
              color: "white",
            }}
            onClick={isBlocked ? unblockUser : blockUser}
          >
            {isBlocked ? "Sblocca utente" : "Blocca utente"}
          </button>
        )}
      </div>
    </WinkWinkScaffold>
  );
}

// ------------------------------------------------------------
// PROFILE CARD
// ------------------------------------------------------------
function ProfileCard({ user, theme }: { user: any; theme: any }) {
  return (
    <div
      className="alias-card"
      style={{ background: theme.background + "50" }}
    >
      <img
        src={user.profileImage}
        className="alias-avatar"
        alt="avatar"
      />

      <div className="alias-card-info">
        <div
          className="alias-card-name"
          style={{ color: theme.text }}
        >
          {user.alias}
        </div>
      </div>
    </div>
  );
}
