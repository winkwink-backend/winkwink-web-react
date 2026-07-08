// src/services/ChatRTCService.ts

import { ChatSignalingService } from "../services/ChatSignalingService";


export type ChatMessage = {
  chatId: number;
  senderId: number;
  receiverId: number;
  type: string;
  content: string;
  createdAt: string;
};

export class ChatRTCService {
  static readonly instance = new ChatRTCService();

  private pc: RTCPeerConnection | null = null;
  private chatChannel: RTCDataChannel | null = null;

  private chatId: number | null = null;
  private userId: number | null = null;
  private otherId: number | null = null;

  private isCaller: boolean = false;

  private chatStream = new BroadcastChannel("chat-rtc-stream");
  get stream(): BroadcastChannel {
    return this.chatStream;
  }

  // ============================================================
  // INIT
  // ============================================================
  async initChatChannel(params: {
    chatId: number;
    userId: number;
    otherId: number;
    isCaller: boolean;
  }): Promise<void> {
    this.chatId = params.chatId;
    this.userId = params.userId;
    this.otherId = params.otherId;
    this.isCaller = params.isCaller;

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // ICE CANDIDATE
    this.pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        const ice = ev.candidate.toJSON();

        ChatSignalingService.instance.sendChatCandidate(
         params.chatId,
         params.userId,
         ice
        );
      }
    };

    // DATA CHANNEL (solo lato receiver)
    this.pc.ondatachannel = (ev) => {
      this.chatChannel = ev.channel;
      this.attachChannelListeners();
    };

    // LATO CALLER: crea datachannel + offer
    if (this.isCaller) {
      this.chatChannel = this.pc.createDataChannel("chat", {
        ordered: true,
      });
      this.attachChannelListeners();

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      ChatSignalingService.instance.sendChatOffer( 
        params.chatId,
        params.userId,
        {
          sdp: offer.sdp!,
          type: offer.type,
        });
      }

    // LISTENER EVENTI WEBRTC
    ChatSignalingService.instance.messageStream.addEventListener(
      "message",
      async (ev: MessageEvent) => {
        const event = ev.data;

        if (event.chat_id !== params.chatId && event.chatId !== params.chatId) return;

        const type = event.type;

        if (type === "webrtc_offer" && !this.isCaller && this.pc) {
         await this.pc.setRemoteDescription({
           sdp: event.offer?.sdp ?? event.sdp,
           type: "offer",
         });

          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);

          ChatSignalingService.instance.sendChatAnswer(
           params.chatId,
           params.userId,
           {
              sdp: answer.sdp!,
             type: answer.type,
           }
         );
        }

        if (type === "answer" && this.isCaller && this.pc) {
          await this.pc.setRemoteDescription({
            sdp: event.sdp,
            type: "answer",
          });
        }

        if (type === "candidate" && this.pc) {
          await this.pc.addIceCandidate({
            candidate: event.candidate,
            sdpMid: event.sdpMid,
            sdpMLineIndex: event.sdpMLineIndex,
          });
        }
      }
    );
  }

  // ============================================================
  // DATA CHANNEL LISTENERS
  // ============================================================
  private attachChannelListeners() {
    if (!this.chatChannel) return;

    this.chatChannel.onmessage = (ev) => {
      const text =
        typeof ev.data === "string"
          ? ev.data
          : new TextDecoder().decode(ev.data);

      const decoded = JSON.parse(text);

      const chatMsg: ChatMessage = {
        chatId: decoded.chat_id,
        senderId: decoded.sender_id,
        receiverId: decoded.receiver_id,
        type: decoded.type,
        content: decoded.content,
        createdAt: decoded.created_at,
      };

      this.chatStream.postMessage(chatMsg);
    };
  }

  // ============================================================
  // SEND TEXT
  // ============================================================
  sendTextMessage(text: string) {
    if (!this.chatChannel || !this.chatId || !this.userId || !this.otherId)
      return;

    const msg: ChatMessage = {
      chatId: this.chatId,
      senderId: this.userId,
      receiverId: this.otherId,
      type: "text",
      content: text,
      createdAt: new Date().toISOString(),
    };

    this.chatChannel.send(
      JSON.stringify({
        chat_id: msg.chatId,
        sender_id: msg.senderId,
        receiver_id: msg.receiverId,
        type: msg.type,
        content: msg.content,
        created_at: msg.createdAt,
      })
    );
  }

  // ============================================================
  // SEND AUDIO
  // ============================================================
  async sendAudio(bytes: Uint8Array) {
    if (!this.chatChannel || !this.chatId || !this.userId || !this.otherId)
      return;

    const msg: ChatMessage = {
      chatId: this.chatId,
      senderId: this.userId,
      receiverId: this.otherId,
      type: "audio",
      content: btoa(String.fromCharCode(...bytes)),
      createdAt: new Date().toISOString(),
    };

    this.chatChannel.send(
      JSON.stringify({
        chat_id: msg.chatId,
        sender_id: msg.senderId,
        receiver_id: msg.receiverId,
        type: msg.type,
        content: msg.content,
        created_at: msg.createdAt,
      })
    );
  }

  // ============================================================
  // SEND ATTACHMENT
  // ============================================================
  async sendAttachment(bytes: Uint8Array, mimeType: string) {
    if (!this.chatChannel || !this.chatId || !this.userId || !this.otherId)
      return;

    const payload = {
      mime: mimeType,
      data: btoa(String.fromCharCode(...bytes)),
    };

    const msg: ChatMessage = {
      chatId: this.chatId,
      senderId: this.userId,
      receiverId: this.otherId,
      type: "attachment",
      content: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
    };

    this.chatChannel.send(
      JSON.stringify({
        chat_id: msg.chatId,
        sender_id: msg.senderId,
        receiver_id: msg.receiverId,
        type: msg.type,
        content: msg.content,
        created_at: msg.createdAt,
      })
    );
  }

  // ============================================================
  // CLOSE
  // ============================================================
  closeChatChannel(chatId: number) {
    if (this.chatId !== chatId) return;

    this.chatChannel?.close();
    this.pc?.close();

    this.chatChannel = null;
    this.pc = null;
  }
}
