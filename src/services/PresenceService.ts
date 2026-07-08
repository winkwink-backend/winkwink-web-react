// src/services/PresenceService.ts

import { SignalingService } from "./SignalingService";

export type PresenceEvent = {
  userId: number;
  isOnline: boolean;
};

export class PresenceService {
  private static _instance: PresenceService | null = null;
  static get instance(): PresenceService {
    if (!this._instance) this._instance = new PresenceService();
    return this._instance;
  }

  private constructor() {
    this.init();
  }

  private initialized = false;

  // ⭐ BroadcastChannel per eventi presence
  private presenceChannel = new BroadcastChannel("wink-presence");

  get presenceStream(): BroadcastChannel {
    return this.presenceChannel;
  }

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    const signaling = SignalingService.instance;

    signaling.onUserOnline = (userId: number) => {
      console.log("🟢 Presence: user", userId, "online");
      this.presenceChannel.postMessage({
        userId,
        isOnline: true,
      } as PresenceEvent);
    };

    signaling.onUserOffline = (userId: number) => {
      console.log("🔴 Presence: user", userId, "offline");
      this.presenceChannel.postMessage({
        userId,
        isOnline: false,
      } as PresenceEvent);
    };
  }

  // ------------------------------------------------------------
  // DISPOSE
  // ------------------------------------------------------------
  dispose(): void {
    this.presenceChannel.close();
  }
}
