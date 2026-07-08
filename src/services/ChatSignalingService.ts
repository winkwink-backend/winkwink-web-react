// src/services/ChatSignalingService.ts

import { io, Socket } from "socket.io-client";

export class ChatSignalingService {
  static readonly instance = new ChatSignalingService();

  private socket: Socket | null = null;

  // STREAM MESSAGGI
  private messageChannel = new BroadcastChannel("chat-signaling-messages");
  get messageStream(): BroadcastChannel {
    return this.messageChannel;
  }

  // STREAM PREVIEW
  private previewChannel = new BroadcastChannel("chat-signaling-preview");
  get previewStream(): BroadcastChannel {
    return this.previewChannel;
  }

  private currentChatId: number | null = null;
  private currentUserId: number | null = null;

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ============================================================
  // CONNECT
  // ============================================================
  async connect(): Promise<void> {
    if (this.isConnected) return;

    this.socket = io(
      "https://winkwink-backend1-production.up.railway.app",
      {
        transports: ["websocket"],
        reconnection: true,
      }
    );

    this.socket.on("connect", () => {
      console.log("🔌 ChatSignalingService connesso");

      if (this.currentChatId !== null && this.currentUserId !== null) {
        this.enterChat(this.currentChatId, this.currentUserId);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ Chat socket connect error:", err);
    });

    this.socket.on("error", (err) => {
      console.error("❌ Chat socket error:", err);
    });

    // LOG DIAGNOSTICO
    this.socket.onAny((event, data) => {
      console.log(`📡 [CHAT SOCKET] event=${event} →`, data);
    });

    // ⭐ NEW MESSAGE
    this.socket.on("new_message", (data) => {
      if (!data) return;
      this.messageChannel.postMessage({ ...data });
    });

    // ⭐ PREVIEW
    this.socket.on("chat_preview", (data) => {
      if (!data) return;
      this.previewChannel.postMessage({ ...data });
    });

    // ⭐ CHAT WEBRTC OFFER
    this.socket.on("chat_webrtc_offer", (data) => {
      if (!data) return;
      this.messageChannel.postMessage({
        type: "webrtc_offer",
        ...data,
      });
    });

    // ⭐ CHAT WEBRTC ANSWER
    this.socket.on("chat_webrtc_answer", (data) => {
      if (!data) return;
      this.messageChannel.postMessage({
        type: "webrtc_answer",
        ...data,
      });
    });

    // ⭐ CHAT WEBRTC ICE CANDIDATE
    this.socket.on("chat_webrtc_ice_candidate", (data) => {
      if (!data) return;
      this.messageChannel.postMessage({
        type: "webrtc_candidate",
        ...data,
      });
    });
  }

  // ============================================================
  // SEND FILE MESSAGE
  // ============================================================
  sendFileMessage(
    chatId: number,
    senderId: number,
    fileUrl: string,
    fileType: string
  ) {
    this.socket?.emit("send_message", {
      chat_id: chatId,
      message: {
        sender_id: senderId,
        content: fileUrl,
        type: fileType,
      },
    });

    console.log(`📤 [SOCKET] send_file_message → chat_${chatId} (${fileType})`);
  }

  // ============================================================
  // ENTER CHAT
  // ============================================================
  enterChat(chatId: number, userId: number) {
    this.currentChatId = chatId;
    this.currentUserId = userId;

    this.socket?.emit("enter_chat", {
      chat_id: chatId,
      user_id: userId,
    });

    console.log(`➡️ [SOCKET] enter_chat → chat_${chatId} user=${userId}`);
  }

  // ============================================================
  // LEAVE CHAT
  // ============================================================
  leaveChat(chatId: number, userId: number) {
    this.socket?.emit("leave_chat", {
      chat_id: chatId,
      user_id: userId,
    });

    console.log(`↩️ [SOCKET] leave_chat → chat_${chatId} user=${userId}`);
  }

  // ============================================================
  // SEND MESSAGE
  // ============================================================
  sendMessage(chatId: number, senderId: number, content: string) {
    this.socket?.emit("send_message", {
      chat_id: chatId,
      message: {
        sender_id: senderId,
        content,
        type: "text",
      },
    });

    console.log(`📤 [SOCKET] send_message → chat_${chatId}`);
  }

  // ============================================================
  // CHAT WEBRTC OFFER
  // ============================================================
  sendChatOffer(chatId: number, userId: number, offer: any) {
    this.socket?.emit("chat_webrtc_offer", {
      chat_id: chatId,
      from_user_id: userId,
      offer,
    });

    console.log(`📤 [SOCKET] chat_webrtc_offer → chat_${chatId}`);
  }

  // ============================================================
  // CHAT WEBRTC ANSWER
  // ============================================================
  sendChatAnswer(chatId: number, userId: number, answer: any) {
    this.socket?.emit("chat_webrtc_answer", {
      chat_id: chatId,
      from_user_id: userId,
      answer,
    });

    console.log(`📤 [SOCKET] chat_webrtc_answer → chat_${chatId}`);
  }

  // ============================================================
  // CHAT WEBRTC ICE CANDIDATE
  // ============================================================
  sendChatCandidate(chatId: number, userId: number, candidate: any) {
    this.socket?.emit("chat_webrtc_ice_candidate", {
      chat_id: chatId,
      from_user_id: userId,
      candidate,
    });

    console.log(`📤 [SOCKET] chat_webrtc_ice_candidate → chat_${chatId}`);
  }
}
