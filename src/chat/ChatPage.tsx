// src/pages/chat/ChatPage.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";

import { AppRoutes } from "../routes/AppRoutes";
import { AppConfig } from "../config/AppConfig";

import { ColorProviderContext } from "../providers/ColorProvider";
import { ChatSignalingService } from "../services/ChatSignalingService";
import { PresenceService } from "../services/PresenceService";
import { StorageService } from "../services/StorageService";
import { AppState } from "../services/AppState";

import { showInfoDialog, showErrorDialog } from "../utils/dialogs";

import "./ChatPage.css";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------
type Message = {
  sender_id: number | string;
  content: string;
  type: "text" | "image" | "video" | "file" | "audio";
  created_at: string;
  status?: "sent" | "delivered" | "seen";
};

type ChatPageParams = {
  chatId: number;
  userId: number;
  otherId: number;
  name?: string;
  isCaller: boolean;
};

// ------------------------------------------------------------
// UTILS
// ------------------------------------------------------------
function normalizeUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${AppConfig.baseUrl}${path}`;
}

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------
export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = React.useContext(ColorProviderContext);

  const { chatId, userId, otherId, name } =
    (location.state || {}) as ChatPageParams;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherActive, setOtherActive] = useState(false);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    if (!chatId || !userId) return;

    (async () => {
      await ChatSignalingService.instance.connect();
      ChatSignalingService.instance.enterChat(chatId, userId);

      // presenza
      PresenceService.instance.presenceStream.onmessage = (event) => {
       const data = event.data;
       if (data.userId === otherId) {
         setOtherActive(data.isOnline);
        }
     };


      // socket messages
      ChatSignalingService.instance.messageStream.onmessage = (event) => {
         const msg = event.data;

         const cid = msg.chat_id ?? msg.chatId;
         const senderId = msg.sender_id ?? msg.senderId;
         const type = msg.type;
         const content = msg.content;
         const createdAt = msg.created_at ?? msg.createdAt;

         if (String(cid) !== String(chatId)) return;

         if (type === "seen") {
           setMessages((prev) =>
             prev.map((m) =>
               String(m.sender_id) === String(userId)
                 ? { ...m, status: "seen" }
                 : m
            )
           );
          return;
        }

       if (String(senderId) === String(userId)) return;

       setMessages((prev) => {
         const exists = prev.some(
            (m) =>
               m.content === content &&
               String(m.sender_id) === String(senderId) &&
               m.created_at === createdAt
          );
          if (exists) return prev;

          return [
            ...prev,
           {
             sender_id: senderId,
             content,
             type,
             created_at: createdAt || new Date().toISOString(),
             status: "delivered",
           },
         ];
      });

      scrollToBottom();
   };
      await loadInitialMessages();

      return () => {
        PresenceService.instance.presenceStream.onmessage = null;
        ChatSignalingService.instance.messageStream.onmessage = null;
        ChatSignalingService.instance.leaveChat(chatId, userId);
      };
    })();
  }, [chatId, userId, otherId]);

  // ------------------------------------------------------------
  // LOAD INITIAL MESSAGES
  // ------------------------------------------------------------
  async function loadInitialMessages() {
    try {
      const res = await fetch(
        `${AppConfig.baseUrl}/chat/messages/${chatId}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (e) {
      console.error("Errore caricamento messaggi:", e);
    }
  }

  // ------------------------------------------------------------
  // SCROLL
  // ------------------------------------------------------------
  function scrollToBottom() {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 200);
  }

  // ------------------------------------------------------------
  // SEND TEXT
  // ------------------------------------------------------------
  async function sendMessage() {
    const t = text.trim();
    if (!t) return;

    setText("");

    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        sender_id: userId,
        content: t,
        type: "text",
        created_at: now,
        status: "sent",
      },
    ]);
    scrollToBottom();

    ChatSignalingService.instance.sendMessage(chatId, userId, t);
  }

  // ------------------------------------------------------------
  // AUDIO RECORDING
  // ------------------------------------------------------------
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const arrayBuffer = await blob.arrayBuffer();
        const base64Audio = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );
        const now = new Date().toISOString();

        setMessages((prev) => [
          ...prev,
          {
            sender_id: userId,
            content: base64Audio,
            type: "audio",
            created_at: now,
            status: "sent",
          },
        ]);
        scrollToBottom();

        ChatSignalingService.instance.sendMessage(
          chatId,
          userId,
          base64Audio
        );
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Errore avvio recorder:", e);
      await showErrorDialog("Errore", "Impossibile avviare la registrazione");
    }
  }

  async function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    rec.stop();
    setIsRecording(false);
  }

  // ------------------------------------------------------------
  // RENDER MESSAGE CONTENT
  // ------------------------------------------------------------
  function renderMessageContent(msg: Message, isMe: boolean) {
    const type = msg.type;
    const content = msg.content;

    switch (type) {
      case "image":
        return (
          <img
            src={content}
            alt="img"
            className="chat-img"
            onClick={() => window.open(content, "_blank")}
          />
        );

      case "video":
        return (
          <button
            className="chat-link"
            onClick={() => window.open(content, "_blank")}
          >
            Apri video
          </button>
        );

      case "file": {
        const url = normalizeUrl(content);
        const fileName = url.split("/").pop() || "file";
        return (
          <button
            className="chat-link"
            onClick={() => window.open(url, "_blank")}
          >
            {fileName}
          </button>
        );
      }

      case "audio":
        return <AudioBubble base64Audio={content} isMe={isMe} />;

      default:
        return (
          <span className="chat-text" style={{ color: isMe ? "#fff" : theme?.text }}>
            {content}
          </span>
        );
    }
  }

  // ------------------------------------------------------------
  // RENDER BUBBLE
  // ------------------------------------------------------------
  function renderBubble(msg: Message) {
    const isMe = String(msg.sender_id) === String(userId);
    const status = msg.status || "sent";

    let icon: string | null = null;
    let iconColor = "transparent";

    if (isMe) {
      if (status === "sent") {
        icon = "✓";
        iconColor = "#ffffffb3";
      } else if (status === "delivered") {
        icon = "✓✓";
        iconColor = "#ffffffb3";
      } else {
        icon = "✓✓";
        iconColor = "#00ff7f";
      }
    }

    const time = msg.created_at ? new Date(msg.created_at) : new Date();
    const formattedTime = `${String(time.getHours()).padStart(
      2,
      "0"
    )}:${String(time.getMinutes()).padStart(2, "0")}`;

    return (
      <div
        className="chat-bubble-row"
        style={{ justifyContent: isMe ? "flex-end" : "flex-start" }}
      >
        <div
          className="chat-bubble"
          style={{
            background: isMe ? theme?.primary : `${theme?.background}80`,
          }}
        >
          {renderMessageContent(msg, isMe)}

          <div className="chat-meta">
            <span>{formattedTime}</span>
            {isMe && icon && (
              <span style={{ color: iconColor }}>{icon}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayName = name || `Utente ${otherId}`;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      showColorSelector={false}
      userId={userId}
      header={
        <div className="chat-header">
          <span className="chat-title">
            {displayName} {otherActive ? "🟢" : "⚪"}
          </span>

          <div className="chat-header-actions">
            <button
              onClick={() =>
                showInfoDialog("Salva chat", "Esportazione PDF disponibile presto")
              }
            >
              💾
            </button>

            <button
              onClick={() =>
                showInfoDialog("Cancella chat", "Funzione disponibile presto")
              }
            >
              🗑️
            </button>

            <button
              onClick={() =>
                showInfoDialog("Info chat", "Le chat sono temporanee e possono scadere")
              }
            >
              ❓
            </button>
          </div>
        </div>
      }
    >
      <div className="chat-container">
        <div ref={scrollRef} className="chat-messages">
          {messages.map((m, i) => (
            <React.Fragment key={i}>{renderBubble(m)}</React.Fragment>
          ))}
        </div>

        <div className="chat-input-area">
          <button
            className="chat-btn"
            onClick={() =>
              showInfoDialog("Allegati", "Pannello allegati disponibile presto")
            }
          >
            +
          </button>

          <button
            className="chat-btn"
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            style={{ color: isRecording ? "red" : theme?.text }}
          >
            {isRecording ? "Stop" : "Mic"}
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="chat-input"
          />

          <button className="chat-btn" onClick={sendMessage}>
            📤
          </button>
        </div>
      </div>
    </WinkWinkScaffold>
  );
}

// ------------------------------------------------------------
// AUDIO BUBBLE
// ------------------------------------------------------------
type AudioBubbleProps = {
  base64Audio: string;
  isMe: boolean;
};

function AudioBubble({ base64Audio, isMe }: AudioBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const clean = base64Audio.replace(/\s+/g, "");
    if (!clean) return;

    const binary = atob(clean);
    const bytes = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
    const blob = new Blob([bytes], { type: "audio/webm" });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => setIsPlaying(false);

    return () => {
      audio.pause();
      URL.revokeObjectURL(url);
    };
  }, [base64Audio]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }

  return (
    <span
      onClick={toggle}
      className="chat-audio"
      style={{ color: isMe ? "#fff" : "#2196f3" }}
    >
      {isPlaying ? "⏹" : "▶"} Audio
    </span>
  );
}
