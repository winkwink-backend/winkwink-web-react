// src/pages/inbox/InboxPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { StorageService } from "../services/StorageService";
import { MessagesService } from "../services/MessagesService";
import { NotificationService } from "../services/NotificationService";
import { ApiService } from "../services/ApiService";

import type { WWContact } from "../models/WWContact";
import { wwContactEmpty } from "../models/WWContact";


import "./InboxPage.css";

export default function InboxPage() {
  const navigate = useNavigate();
  const theme = React.useContext(ColorProviderContext);

  const [inbox, setInbox] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    loadUserAndInbox();
  }, []);

  async function loadUserAndInbox() {
    const id = await StorageService.getUserId();
    setUserId(id);

    if (!id) return;

    const serverList = await MessagesService.getInbox(id);

    await NotificationService.instance.loadNotifications();
    const localList = NotificationService.instance.all;

    const merged = [...serverList, ...localList];
    merged.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

    setInbox(merged);
  }

  // ------------------------------------------------------------
  // ACCEPT INVITE
  // ------------------------------------------------------------
  async function acceptInvite(item: any) {
    const payload = item.payload || {};
    const fromUserId = item.from_user_id;

    const contact: WWContact = {
      ...wwContactEmpty(),
      userId: String(fromUserId),
      alias: payload.name || "",
      name: payload.name || "",
      lastName: "",
      phone: payload.phone || "",
      publicKey: "",
      qrData: payload.qrData || "",
    };

    await StorageService.saveOrUpdateWWContact(contact);

    const profile = await StorageService.getProfile();
    const myName = `${profile.name} ${profile.surname}`;
    const myPhone = profile.email || "";
    const myQr = await StorageService.getQrData();

    await ApiService.post("/inbox/create", {
      to_user_id: fromUserId,
      from_user_id: userId,
      type: "invite_accept",
      payload: {
        name: myName,
        phone: myPhone,
        qrData: myQr,
      },
    });

    await loadUserAndInbox();
    alert("Contatto aggiunto");
  }

  // ------------------------------------------------------------
  // REJECT INVITE
  // ------------------------------------------------------------
  async function rejectInvite(item: any) {
    await StorageService.removeInboxItem(item);
    await loadUserAndInbox();
  }

  // ------------------------------------------------------------
  // OPEN ITEM
  // ------------------------------------------------------------
  async function openItem(item: any) {
    const type = item.type;
    const payload = item.payload;

    // INVITE
    if (type === "invite") {
      const name = payload?.name || "Utente";

      const accept = window.confirm(`Accettare l'invito da ${name}?`);
      if (accept) await acceptInvite(item);
      else await rejectInvite(item);
      return;
    }

    // INVITE ACCEPT
    if (type === "invite_accept") {
      const fromUserId = item.from_user_id;

      const contact: WWContact = {
        ...wwContactEmpty(),
        userId: String(fromUserId),
        name: payload?.name || "Utente",
        lastName: "",
        phone: payload?.phone || "",
        publicKey: "",
        qrData: payload?.qrData || "",
      };

      await StorageService.saveOrUpdateWWContact(contact);
      await loadUserAndInbox();

      alert("Contatto aggiunto");
      return;
    }

    // LEGACY MESSAGE
    if (type === "message") {
      const otherId = item.from_user_id;

      const res = await ApiService.post("/chat/create", {
        user1: userId,
        user2: otherId,
      });

      const chatId = res.chat_id;
      if (!chatId) {
        alert("Errore apertura chat");
        return;
      }

      navigate("/chat", {
        state: {
          chatId,
          userId,
          otherId,
          name: `Utente ${otherId}`,
          isCaller: true,
        },
      });
      return;
    }

    // CHAT INVITE
    if (type === "chat_invite") {
      const chatWith = payload.chat_with;

      const res = await ApiService.post("/chat/create", {
        user1: userId,
        user2: chatWith,
      });

      const chatId = res.chat_id;
      if (!chatId) {
        alert("Errore apertura chat");
        return;
      }

      navigate("/chat", {
        state: {
          chatId,
          userId,
          otherId: chatWith,
          name: "Chat",
          isCaller: false,
        },
      });
      return;
    }

    // REALTIME CHAT
    if (type === "chat") {
      const chatRoomId = payload.chatId || payload.chat_id;
      const otherUser =
        payload.senderId || payload.sender_id || item.from_user_id;

      if (chatRoomId) {
        if (item.id) {
          NotificationService.instance.updateStatus(
            String(item.id),
            "read"
          );
        }

        navigate("/chat", {
          state: {
            chatId: Number(chatRoomId),
            userId,
            otherId: Number(otherUser),
            name: payload.senderName || "Chat",
            isCaller: false,
          },
        });
      }
      return;
    }

    // FILE P2P
    if (type === "incoming_file" || type === "file_transfer_request") {
      if (item.id) {
        NotificationService.instance.updateStatus(
          String(item.id),
          "read"
        );
      }
    }

    await loadUserAndInbox();
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      appBarTitle="Inbox"
      showColorSelector={false}
    >
      <div className="inbox-container">
        {inbox.length === 0 ? (
          <div className="inbox-empty">Nessuna notifica</div>
        ) : (
          <div className="inbox-list">
            {inbox.map((item, i) => {
              const type = item.type;
              const payload = item.payload;

              let title = "";
              if (type === "invite") {
                title = `Invito da ${payload?.name || "Utente"}`;
              } else if (type === "invite_accept") {
                title = `${payload?.name || "Utente"} ha accettato l'invito`;
              } else if (type === "message" || type === "chat") {
                const senderName =
                  payload?.senderName ||
                  payload?.name ||
                  "";
                title = senderName
                  ? `Messaggio da ${senderName}`
                  : `Messaggio da ${item.from_user_id}`;
              } else if (
                type === "file_transfer_request" ||
                type === "incoming_file"
              ) {
                title = "File P2P in arrivo";
              } else if (type === "chat_invite") {
                title = "Invito alla chat";
              } else {
                title = "Notifica";
              }

              let subtitle = "";
              if (type === "invite") {
                subtitle = "Richiesta di aggiunta contatto";
              } else if (type === "invite_accept") {
                subtitle = "Contatto aggiunto";
              } else if (type === "message" || type === "chat") {
                subtitle =
                  payload?.content ||
                  payload?.message ||
                  payload?.preview ||
                  "Nuovo messaggio";
              } else if (
                type === "file_transfer_request" ||
                type === "incoming_file"
              ) {
                subtitle = `Tocca per scaricare: ${
                  payload?.fileName || "File"
                }`;
              } else if (type === "chat_invite") {
                subtitle = "Tocca per entrare nella chat";
              } else {
                subtitle = item.created_at || "";
              }

              const icons : Record<string, string> = {
                invite: "➕",
                invite_accept: "✔️",
                message: "💬",
                chat: "💬",
                file_transfer_request: "📥",
                incoming_file: "📥",
                chat_invite: "👥",
              }
              const icon = icons[type] ?? "🔔";

              return (
                <div
                  key={i}
                  className="inbox-item"
                  onClick={() => openItem(item)}
                >
                  <div className="inbox-icon">{icon}</div>

                  <div className="inbox-info">
                    <div className="inbox-title">{title}</div>
                    <div className="inbox-subtitle">{subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
