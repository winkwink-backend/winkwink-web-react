// src/pages/contacts/ContactsPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { StorageService } from "../services/StorageService";
import { ContactSyncService } from "../services/ContactSyncService";
import { ApiService } from "../services/ApiService";
import { AppState } from "../services/AppState";

import "./ContactsPage.css";

export default function ContactsPage() {
  const navigate = useNavigate();
  const theme = React.useContext(ColorProviderContext);

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [filterWW, setFilterWW] = useState("");
  const [filterAlias, setFilterAlias] = useState("");

  const [tab, setTab] = useState<"ww" | "alias">("ww");

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    loadUserId();
    loadSavedContactsIfNeeded();
  }, []);

  async function loadUserId() {
    const id = await StorageService.getUserId();
    setUserId(id);
  }

  async function loadSavedContactsIfNeeded() {
    if (AppState.wwContacts.length === 0) {
     const saved = await StorageService.getWWContacts();
     AppState.wwContacts = saved.map((c) => ({
       ...c,
       userId: String(c.userId),
       peerId: String(c.peerId),
       publicKey: c.publicKey || "",
       version: c.version || 1,
     }));
  }  
  
    if (AppState.aliasContacts.length === 0) {
      const savedAlias = await StorageService.getAliasContacts();
      AppState.aliasContacts = savedAlias;
    }
  }

  // ------------------------------------------------------------
  // REFRESH CONTACTS
  // ------------------------------------------------------------
  async function refreshContacts() {
    setLoading(true);

    const sync = await ContactSyncService.syncContacts();

    AppState.allContacts = sync.allContacts;
    AppState.wwContacts = sync.wwContacts;
    AppState.chats = sync.chats;

    await StorageService.saveWWContacts(sync.wwContacts);
    await StorageService.saveContacts(sync.allContacts);

    setLoading(false);
  }

  // ------------------------------------------------------------
  // OPEN CHAT (WW)
  // ------------------------------------------------------------
  async function openChatWW(c: any) {
    if (!userId) return;

    const peerId = Number(c.peerId);
    if (!peerId) {
      alert("Errore: peerId non valido");
      return;
    }

    const res = await ApiService.post("/chat/create", {
      user1: userId,
      user2: peerId,
    });

    const chatId = res.chat_id;
    if (!chatId) {
      alert("Errore apertura chat");
      return;
    }

    navigate("/chat", {
      state: {
        chatId: Number(chatId),
        userId,
        otherId: peerId,
        name: c.alias,
        isCaller: true,
        contact: c,
      },
    });
  }

  // ------------------------------------------------------------
  // OPEN CHAT (Alias)
  // ------------------------------------------------------------
  async function openChatAlias(c: any) {
    if (!userId) return;

    const peerId = Number(c.peerId);
    if (!peerId) {
      alert("Errore: peerId non valido");
      return;
    }

    const res = await ApiService.post("/chat/create", {
      user1: userId,
      user2: peerId,
    });

    const chatId = res.chat_id;
    if (!chatId) {
      alert("Errore apertura chat");
      return;
    }

    navigate("/chat", {
      state: {
        chatId: Number(chatId),
        userId,
        otherId: peerId,
        name: c.alias,
        isCaller: true,
        contact: c,
      },
    });
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (!userId) {
    return (
      <WinkWinkScaffold showColorSelector={false}>
        <div className="contacts-loading">Caricamento…</div>
      </WinkWinkScaffold>
    );
  }

  return (
    <WinkWinkScaffold showColorSelector={false}>
      {loading ? (
        <div className="contacts-loading">Caricamento…</div>
      ) : (
        <div className="contacts-container">
          {/* SEARCH ALIAS GLOBAL */}
          <div className="contacts-search-global">
            <input
              className="contacts-input"
              placeholder="Cerca alias…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate("/alias-search", {
                    state: { alias: (e.target as HTMLInputElement).value },
                  });
                }
              }}
            />
          </div>

          {/* TABS */}
          <div className="contacts-tabs">
            <button
              className={`contacts-tab ${tab === "ww" ? "active" : ""}`}
              onClick={() => setTab("ww")}
            >
              WinkWink
            </button>

            <button
              className={`contacts-tab ${tab === "alias" ? "active" : ""}`}
              onClick={() => setTab("alias")}
            >
              Alias
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="contacts-tab-content">
            {tab === "ww"
              ? renderWinkWinkTab(theme)
              : renderAliasTab(theme)}
          </div>
        </div>
      )}
    </WinkWinkScaffold>
  );

  // ------------------------------------------------------------
  // TAB WINKWINK
  // ------------------------------------------------------------
  function renderWinkWinkTab(theme: any) {
    const list = AppState.wwContacts.filter(
      (c) =>
        c.alias.toLowerCase().includes(filterWW.toLowerCase()) ||
        c.name.toLowerCase().includes(filterWW.toLowerCase())
    );

    return (
      <div className="contacts-tab-inner">
        <input
          className="contacts-input"
          placeholder="Cerca contatti…"
          value={filterWW}
          onChange={(e) => setFilterWW(e.target.value)}
        />

        <div className="contacts-list">
          {list.map((c, i) => (
            <div key={i} className="contacts-item">
              <div className="contacts-avatar">
                {c.profileImageUrl ? (
                  <img src={c.profileImageUrl} alt="avatar" />
                ) : (
                  <div className="contacts-avatar-placeholder">👤</div>
                )}
              </div>

              <div className="contacts-info">
                <div className="contacts-name">{c.alias}</div>
              </div>

              <button
                className="contacts-chat-btn"
                onClick={() => openChatWW(c)}
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // TAB ALIAS
  // ------------------------------------------------------------
  function renderAliasTab(theme: any) {
    const list = AppState.aliasContacts.filter((c) =>
      c.alias.toLowerCase().includes(filterAlias.toLowerCase())
    );

    return (
      <div className="contacts-tab-inner">
        <input
          className="contacts-input"
          placeholder="Cerca contatti…"
          value={filterAlias}
          onChange={(e) => setFilterAlias(e.target.value)}
        />

        <div className="contacts-list">
          {list.map((c, i) => (
            <div key={i} className="contacts-item">
              <div className="contacts-avatar">
                {c.profileImageUrl ? (
                  <img src={c.profileImageUrl} alt="avatar" />
                ) : (
                  <div className="contacts-avatar-placeholder">👤</div>
                )}
              </div>

              <div className="contacts-info">
                <div className="contacts-name">{c.alias}</div>
              </div>

              <button
                className="contacts-chat-btn"
                onClick={() => openChatAlias(c)}
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
