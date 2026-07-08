// src/services/SignalingService.ts

import { io, Socket } from "socket.io-client";
import { StorageService } from "./StorageService";
import { FileSocketHandler } from "./FileSocketHandler";
import { NotificationService } from "./NotificationService";

export type FileIncomingEvent = {
  sessionId: string;
  fromUserId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type FileAcceptEvent = {
  sessionId: string;
  fromUserId: number;
};

export type FileRejectEvent = {
  sessionId: string;
  fromUserId: number;
};

export type FileOfferEvent = {
  sessionId: string;
  offer: Record<string, any>;
  fromUserId: number;
};

export type FileAnswerEvent = {
  sessionId: string;
  answer: Record<string, any>;
  fromUserId: number;
};

export type FileCandidateEvent = {
  sessionId: string;
  candidate: Record<string, any>;
  fromUserId: number;
};

export class SignalingService {
  private static _instance: SignalingService | null = null;
  static get instance(): SignalingService {
    if (!this._instance) this._instance = new SignalingService();
    return this._instance;
  }

  private constructor() {}

  private socket: Socket | null = null;
  private connecting = false;
  public myUserId: number | null = null;


  // ⭐ Connection state
  private connectionChannel = new BroadcastChannel("wink-socket-connection");
  isConnected = false;

  // ⭐ Fallback HTTP
  private fallbackChannel = new BroadcastChannel("wink-fallback-http");

  // ⭐ File handler
  private fileHandler: FileSocketHandler | null = null;

  // ⭐ Event channels
  private incomingChannel = new BroadcastChannel("wink-file-incoming");
  private acceptChannel = new BroadcastChannel("wink-file-accept");
  private rejectChannel = new BroadcastChannel("wink-file-reject");
  private offerChannel = new BroadcastChannel("wink-file-offer");
  private answerChannel = new BroadcastChannel("wink-file-answer");
  private candidateChannel = new BroadcastChannel("wink-file-candidate");

  // ⭐ Presence
  onUserOnline?: (userId: number) => void;
  onUserOffline?: (userId: number) => void;

  // ⭐ Background / Foreground
  onUserBackground?: (userId: number) => void;
  onUserForeground?: (userId: number) => void;

  private safeParseInt(value: any): number {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    return Number(value) || 0;
  }

  // ------------------------------------------------------------
  // CONNECT
  // ------------------------------------------------------------
  async connect(userId: number): Promise<void> {
    if (this.connecting) return;
    this.connecting = true;
    this.myUserId = userId;

    this.socket = io("https://winkwink-backend1-production.up.railway.app", {
      transports: ["websocket"],
      reconnection: true,
      autoConnect: false,
    });

    this.socket.connect();

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.connectionChannel.postMessage({ connected: true });
      this.socket!.emit("register", userId);
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      this.connectionChannel.postMessage({ connected: false });
    });

    // ------------------------------------------------------------
    // FILE HANDLER
    // ------------------------------------------------------------
    this.fileHandler = new FileSocketHandler(this.socket);
    this.fileHandler.initListeners();

    // Incoming file
    this.fileHandler.onIncomingFile = (data) => {
      if (!data) return;

      const event: FileIncomingEvent = {
        sessionId: String(data.sessionId || ""),
        fromUserId: this.safeParseInt(data.fromUserId),
        fileName: String(data.fileName || ""),
        fileType: String(data.fileType || ""),
        fileSize: this.safeParseInt(data.fileSize),
      };

      this.incomingChannel.postMessage(event);
    };

    // Accept
    this.fileHandler.onFileAccept = (data) => {
      if (!data) return;

      const event: FileAcceptEvent = {
        sessionId: String(data.sessionId || ""),
        fromUserId: this.safeParseInt(data.fromUserId),
      };

      this.acceptChannel.postMessage(event);
    };

    // Reject
    this.fileHandler.onFileReject = (data) => {
      if (!data) return;

      const event: FileRejectEvent = {
        sessionId: String(data.sessionId || ""),
        fromUserId: this.safeParseInt(data.fromUserId),
      };

      this.rejectChannel.postMessage(event);
    };

    // OFFER
    this.socket.on("file_webrtc_offer", (data) => {
      if (!data) return;

      const event: FileOfferEvent = {
        sessionId: String(data.sessionId || ""),
        offer: data.offer || {},
        fromUserId: this.safeParseInt(data.fromUserId),
      };

      this.offerChannel.postMessage(event);
    });

    // ANSWER
    this.socket.on("file_webrtc_answer", (data) => {
      if (!data) return;

      const event: FileAnswerEvent = {
        sessionId: String(data.sessionId || ""),
        answer: data.answer || {},
        fromUserId: this.safeParseInt(data.fromUserId),
      };

      this.answerChannel.postMessage(event);
    });

    // ICE CANDIDATE
    this.socket.on("file_webrtc_ice_candidate", (data) => {
      if (!data) return;

      const event: FileCandidateEvent = {
        sessionId: String(data.sessionId || ""),
        candidate: data.candidate || {},
        fromUserId: this.safeParseInt(data.fromUserId),
      };

      this.candidateChannel.postMessage(event);
    });

    // ------------------------------------------------------------
    // FALLBACK HTTP
    // ------------------------------------------------------------
    this.socket.on("fallback_to_http", (data) => {
      if (!data) return;
      this.fallbackChannel.postMessage(data);
    });

    // ------------------------------------------------------------
    // BACKGROUND / FOREGROUND
    // ------------------------------------------------------------
    this.socket.on("user_background", (data) => {
      if (!data) return;
      const id = this.safeParseInt(data.userId);
      this.onUserBackground?.(id);
    });

    this.socket.on("user_foreground", (data) => {
      if (!data) return;
      const id = this.safeParseInt(data.userId);
      this.onUserForeground?.(id);
    });

    // ------------------------------------------------------------
    // PRESENCE
    // ------------------------------------------------------------
    this.socket.on("user_online", (data) => {
      if (!data) return;
      const id = this.safeParseInt(data.userId);
      this.onUserOnline?.(id);
    });

    this.socket.on("user_offline", (data) => {
      if (!data) return;
      const id = this.safeParseInt(data.userId);
      this.onUserOffline?.(id);
    });

    // ------------------------------------------------------------
    // ALIAS REALTIME
    // ------------------------------------------------------------
    this.socket.on("alias_request_received", (data) => {
      if (data) NotificationService.instance.addAliasNotification(data);
    });

    this.socket.on("alias_request_accepted", (data) => {
      if (data) NotificationService.instance.addAliasNotification(data);
    });

    this.socket.on("alias_request_rejected", (data) => {
      if (data) NotificationService.instance.addAliasNotification(data);
    });

    this.connecting = false;
  }

  // ------------------------------------------------------------
  // ENSURE CONNECTED
  // ------------------------------------------------------------
  async ensureConnected(): Promise<void> {
    if (this.isConnected || this.connecting) return;

    const storedId = await StorageService.getUserId();
    if (!storedId) return;

    await this.connect(storedId);
    await this.waitUntilConnected();
  }

  async waitUntilConnected(): Promise<void> {
    while (!this.isConnected) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // ------------------------------------------------------------
  // EMIT
  // ------------------------------------------------------------
  emitFileCreateSession(params: {
    sessionId: string;
    toUserId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
  }): void {
    this.socket?.emit("file_create_session", params);
  }

  emitFileAccept(params: { sessionId: string; fromUserId: number }): void {
    this.socket?.emit("file_accept", params);
  }

  emitFileReject(params: { sessionId: string; fromUserId: number }): void {
    this.socket?.emit("file_reject", params);
  }

  emitFileOffer(params: {
    toUserId: number;
    sessionId: string;
    offer: Record<string, any>;
  }): void {
    this.socket?.emit("file_webrtc_offer", params);
  }

  emitFileAnswer(params: {
    toUserId: number;
    sessionId: string;
    answer: Record<string, any>;
  }): void {
    this.socket?.emit("file_webrtc_answer", params);
  }

  emitFileCandidate(params: {
    toUserId: number;
    sessionId: string;
    candidate: Record<string, any>;
  }): void {
    this.socket?.emit("file_webrtc_ice_candidate", params);
  }
}
