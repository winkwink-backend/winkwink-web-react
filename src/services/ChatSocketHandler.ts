// src/services/ChatSocketHandler.ts

import { Socket } from "socket.io-client";

export class ChatSocketHandler {
  private socket: Socket | null;

  private chatMessageChannel = new BroadcastChannel("chat-socket-messages");
  get chatMessageStream(): BroadcastChannel {
    return this.chatMessageChannel;
  }

  private chatPreviewChannel = new BroadcastChannel("chat-socket-preview");
  get chatPreviewStream(): BroadcastChannel {
    return this.chatPreviewChannel;
  }

  constructor(socket: Socket | null) {
    this.socket = socket;
  }

  // ============================================================
  // INIT LISTENERS
  // ============================================================
  initListeners() {
    if (!this.socket) return;

    // ============================================================
    // ⭐ NEW MESSAGE (standard)
    // ============================================================
    this.socket.on("new_message", (data: any) => {
      if (!data) return;

      const payload = data.payload ?? data;
      const msg = { ...payload };

      // Normalizzazione
      msg.chat_id = msg.chat_id ?? msg.chatId;
      msg.sender_id = msg.sender_id ?? msg.senderId;
      msg.receiver_id = msg.receiver_id ?? msg.receiverId;
      msg.created_at = msg.created_at ?? msg.createdAt;
      msg.type = msg.type ?? "text";

      console.debug("💬 [CHAT] new_message →", msg);

      this.chatMessageChannel.postMessage(msg);
      this.chatPreviewChannel.postMessage(msg);
    });

    // ============================================================
    // ⭐ CHAT PREVIEW
    // ============================================================
    this.socket.on("chat_preview", (data: any) => {
      if (!data) return;

      const msg = { ...data };

      msg.chat_id = msg.chat_id ?? msg.chatId;
      msg.content = msg.content ?? msg.last_message;

      console.debug("📝 [CHAT] chat_preview →", msg);

      this.chatPreviewChannel.postMessage(msg);
    });

    // ============================================================
    // ⭐ SEEN
    // ============================================================
    this.socket.on("seen", (data: any) => {
      if (!data) return;

      const msg = { ...data, type: "seen" };

      console.debug("👁 [CHAT] seen →", msg);

      this.chatMessageChannel.postMessage(msg);
    });

    // ============================================================
    // ⭐ MESSAGE DELIVERED
    // ============================================================
    this.socket.on("delivered", (data: any) => {
      if (!data) return;

      const msg = { ...data, type: "delivered" };

      console.debug("📨 [CHAT] delivered →", msg);

      this.chatMessageChannel.postMessage(msg);
    });

    // ============================================================
    // ⭐ MESSAGE SENT
    // ============================================================
    this.socket.on("sent", (data: any) => {
      if (!data) return;

      const msg = { ...data, type: "sent" };

      console.debug("📤 [CHAT] sent →", msg);

      this.chatMessageChannel.postMessage(msg);
    });
  }

  // ============================================================
  // DISPOSE
  // ============================================================
  dispose() {
    this.chatMessageChannel.close();
    this.chatPreviewChannel.close();
  }
}
