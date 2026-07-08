// src/pages/chat/ChatListPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { AppState } from "../services/AppState";
import { PresenceService } from "../services/PresenceService";
import { SignalingService } from "../services/SignalingService";
import { ChatSignalingService } from "../services/ChatSignalingService";

import { AppRoutes } from "../routes/AppRoutes";
import type { WWContact } from "../models/WWContact";
import { wwContactFromJson } from "../models/WWContact";
import { wwContactEmpty } from "../models/WWContact";


import "./ChatListPage.css";

export default function ChatListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = React.useContext(ColorProviderContext);

  const userId = Number(new URLSearchParams(location.search).get("userId"));

  const [loading, setLoading] = useState(true);
  const [chatList, setChatList] = useState<any[]>([]);
  const [contacts, setContacts] = useState<WWContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<WWContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    loadInitialData();
    setupPresenceListener();
    setupChatPreviewListener();

    SignalingService.instance.ensureConnected();
    ChatSignalingService.instance.connect();
  }, []);

  // ------------------------------------------------------------
  // LOAD INITIAL DATA
  // ------------------------------------------------------------
  async function loadInitialData() {
    try {
      const sync = await AppState.syncAll();

      const chats = (sync.chats || []).map((c: any) => ({
        chat_id: Number(c.chat_id),
        other_id: Number(c.other_id),
        other_name: c.other_name || "Utente",
        last_message: c.last_message || "",
      }));

      const wwContacts = (sync.ww_contacts || []).map((c: any) =>
        wwContactFromJson({
           ...c,
           peerId: c.peerId?.toString(),
        })
      );

      setChatList(chats);
      setContacts(wwContacts);
      setFilteredContacts(wwContacts);
      setLoading(false);
    } catch (e) {
      console.error("SYNC ERROR:", e);
    }
  }

  // ------------------------------------------------------------
  // PRESENCE LISTENER
  // ------------------------------------------------------------
  function setupPresenceListener() {
    PresenceService.instance.presenceStream.onmessage = (event) => {
      const data = event.data;

      setContacts((prev) =>
        prev.map((c) =>
         c.peerId === String(data.userId)
           ? { ...c, isOnline: data.isOnline }
           : c
        )
      );
    };
  }

  // ------------------------------------------------------------
  // CHAT PREVIEW LISTENER
  // ------------------------------------------------------------
  function setupChatPreviewListener() {
    ChatSignalingService.instance.previewStream.onmessage = (event) => {
      const msg = event.data;

      const chatId = Number(msg.chat_id);
      const type = msg.type;
      const content = msg.content;

      let preview = content;
      if (type === "image") preview = "📷 Foto";
      if (type === "video") preview = "🎥 Video";
      if (type === "file") preview = "📄 File";

     setChatList((prev) => {
       const idx = prev.findIndex((c) => c.chat_id === chatId);
       if (idx === -1) {
          loadInitialData();
          return prev;
       }

       const updated = [...prev];
       updated[idx].last_message = preview;
       return updated;
      });
   };
  }

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------
  function filterContacts(query: string) {
    setSearchQuery(query.toLowerCase());
    setFilteredContacts(
      contacts.filter((c) =>
        `${c.name} ${c.lastName}`.toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  // ------------------------------------------------------------
  // NAVIGATE TO CHAT
  // ------------------------------------------------------------
  function navigateToChat(chatId: number, otherId: number, name: string) {
  const contact =
    contacts.find((c) => c.peerId === String(otherId)) ||
    wwContactEmpty();

  navigate(AppRoutes.chat, {
    state: {
      chatId,
      userId,
      otherId,
      name,
      isCaller: true,
      contact,
    },
  });
}

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false} userId={userId}>
      {loading ? (
        <div className="chatlist-loading">Caricamento…</div>
      ) : (
        <div className="chatlist-container">
          <h2 className="chatlist-title">Chat</h2>

          <input
            className="chatlist-search"
            placeholder="Cerca contatti…"
            value={searchQuery}
            onChange={(e) => filterContacts(e.target.value)}
          />

          <div className="chatlist-content">
            {searchQuery ? (
              <FilteredContacts
                contacts={filteredContacts}
                theme={theme}
                onSelect={(c) =>
                  navigateToChat(c.chatId || 0, Number(c.peerId), `${c.name} ${c.lastName}`)
                }
              />
            ) : (
              <ChatList
                chats={chatList}
                contacts={contacts}
                theme={theme}
                onSelect={(c) =>
                  navigateToChat(c.chat_id, c.other_id, c.other_name)
                }
              />
            )}
          </div>
        </div>
      )}
    </WinkWinkScaffold>
  );
}

// ------------------------------------------------------------
// CHAT LIST
// ------------------------------------------------------------
function ChatList({
  chats,
  contacts,
  theme,
  onSelect,
}: {
  chats: any[];
  contacts: WWContact[];
  theme: any;
  onSelect: (c: any) => void;
}) {
  if (!chats.length) {
    return <div className="chatlist-empty">Nessuna chat</div>;
  }

  return (
  <div className="chatlist-list">
    {chats.map((c, i) => {
      const contact =
        contacts.find((x) => x.peerId === String(c.other_id)) ||
        wwContactEmpty();

      return (
        <div key={i} className="chatlist-item" onClick={() => onSelect(c)}>
          <div
            className="chatlist-avatar"
            style={{
              backgroundColor: contact.isOnline ? "green" : theme.primary,
            }}
          >
            👤
          </div>

          <div className="chatlist-info">
            <div className="chatlist-name">{c.other_name}</div>
            <div className="chatlist-preview">{c.last_message}</div>
          </div>
        </div>
      );
    })}
  </div>
);
}

// ------------------------------------------------------------
// FILTERED CONTACTS
// ------------------------------------------------------------
function FilteredContacts({
  contacts,
  theme,
  onSelect,
}: {
  contacts: WWContact[];
  theme: any;
  onSelect: (c: WWContact) => void;
}) {
  if (!contacts.length) {
    return <div className="chatlist-empty">Nessun contatto trovato</div>;
  }

  return (
    <div className="chatlist-list">
      {contacts.map((c, i) => (
        <div key={i} className="chatlist-item" onClick={() => onSelect(c)}>
          <div className="chatlist-avatar" style={{ backgroundColor: theme.primary }}>
            👤
          </div>

          <div className="chatlist-info">
            <div className="chatlist-name">
              {c.name} {c.lastName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
