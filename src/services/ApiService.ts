// src/services/ApiService.ts

import { AppConfig } from "../config/AppConfig";
import { StorageService } from "./StorageService";
import { userProfileFromJson } from "../models/UserProfile";
import type { UserProfile } from "../models/UserProfile";



export class ApiService {
  // ⭐ Costruisce URL completo
  static buildUrl(path: string): string {
    if (!path.startsWith("/")) path = "/" + path;
    return `${AppConfig.baseUrl}${path}`;
  }

  // ⭐ POST generico JSON con token persistente
  static async post(path: string, body: any): Promise<any> {
    const url = this.buildUrl(path);
    const token = await StorageService.getAuthToken();

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      return JSON.parse(text);
    } catch (e: any) {
      console.error(`Errore POST ${path}`, e);
      return { error: e.toString() };
    }
  }

  // ⭐ GET generico con token persistente
  static async get(path: string): Promise<any> {
    const url = this.buildUrl(path);
    const token = await StorageService.getAuthToken();

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) return null;

      const text = await res.text();
      return JSON.parse(text);
    } catch (e) {
      console.error(`Errore GET ${path}`, e);
      return null;
    }
  }

  // ------------------------------------------------------------
  // ⭐ REGISTER USER
  // ------------------------------------------------------------
  static async registerUser(params: {
    phone: string;
    publicKey: string;
    name: string;
    lastName: string;
    alias: string;
    qrData: string;
    password: string;
    email: string;
  }): Promise<Record<string, any> | null> {
    const res = await this.post("/login", {
      phone: params.phone,
      public_key: params.publicKey,
      name: params.name,
      last_name: params.lastName,
      qr_data: params.qrData,
      alias: params.alias.trim(),
      password: params.password.trim(),
      email: params.email,
    });

    if (!res) return { error: "NULL_RESPONSE" };
    return res;
  }

  // ------------------------------------------------------------
  // ⭐ RECOVER PROFILE (alias + password)
  // ------------------------------------------------------------
  static async recoverProfile(alias: string, password: string) {
    const res = await this.post("/identity/recoverProfile", {
      alias: alias.trim(),
      password: password.trim(),
    });

    return res ?? { error: "NULL_RESPONSE" };
  }

  // ------------------------------------------------------------
  // ⭐ RECOVER WITH KEY (upload file)
  // ------------------------------------------------------------
  static async recoverWithKey(fileBytes: Uint8Array) {
    const url = this.buildUrl("/identity/recoverWithKey");

    // Converti in ArrayBuffer "pulito"
   const cleanBuffer = new ArrayBuffer(fileBytes.byteLength)
   const view = new Uint8Array(cleanBuffer);
   view.set(fileBytes);

   const blob = new Blob([cleanBuffer], { type: "image/png" });

   const form = new FormData();
   form.append("file", blob, "winkwink_identity.png");

   try {
     const res = await fetch(url, {
       method: "POST",
        body: form,
      });

     const text = await res.text();
     return JSON.parse(text);
   } catch (e: any) {
     console.error("Errore recoverWithKey", e);
     return { error: e.toString() };
   }
  }

  // ------------------------------------------------------------
  // ⭐ UPDATE FCM TOKEN
  // ------------------------------------------------------------
  static async updateFcmToken(userId: number, token: string) {
    await this.post("/update_fcm_token", { userId, token });
  }

  // ------------------------------------------------------------
  // ⭐ GET MY PROFILE
  // ------------------------------------------------------------
  static async getMyProfile(): Promise<UserProfile | null> {
    const savedId = await StorageService.getUserId();
    if (!savedId) return null;

    const res = await this.get(`/users/${savedId}`);
    if (!res) return null;

    const data = Array.isArray(res) ? res[0] : res;
    return userProfileFromJson(data);
  }

  // ------------------------------------------------------------
  // ⭐ GET CHAT OFFER (WebRTC)
  // ------------------------------------------------------------
  static async getChatOffer(myId: number, otherId: number) {
    return await this.get(
      `/p2p/chat/offer?my_user_id=${myId}&other_user_id=${otherId}`
    );
  }

  // ------------------------------------------------------------
  // ⭐ ACCEPT P2P SESSION
  // ------------------------------------------------------------
  static async acceptSession(sessionId: string): Promise<boolean> {
    const res = await this.post("/p2p/session/accept", { sessionId });
    return res?.success === true;
  }

  // ------------------------------------------------------------
  // ⭐ DOWNLOAD FILE CIFRATO (PNG STEGO)
  // ------------------------------------------------------------
  static async downloadEncryptedFile(fileId: string): Promise<Uint8Array> {
    const url = `${AppConfig.baseUrl}/encrypt/download/${fileId}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Errore download file PNG cifrato");

    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }

  // ------------------------------------------------------------
  // ⭐ REGISTER SECRET MESSAGE
  // ------------------------------------------------------------
  static async registerSecretMessage(params: {
    messageId: string;
    kmsg: string;
    senderId: number;
    recipients: { userId: string }[];
  }): Promise<boolean> {
    const token = await StorageService.getAuthToken();
    const url = this.buildUrl("/messages/register");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messageId: params.messageId,
        kmsg: params.kmsg,
        senderId: params.senderId,
        recipients: params.recipients.map((c) => ({
          id: parseInt(c.userId),
        })),
        metadata: null,
      }),
    });

    return res.status === 200;
  }

  // ------------------------------------------------------------
  // ⭐ FETCH KMSG
  // ------------------------------------------------------------
  static async fetchKmsg(messageId: string): Promise<string | null> {
    const res = await this.get(`/messages/fetch-kmsg/${messageId}`);
    if (!res) return null;
    return res.kmsg?.toString() ?? null;
  }

  // ------------------------------------------------------------
  // ⭐ UPLOAD PROFILE IMAGE
  // ------------------------------------------------------------
  static async uploadProfileImage(file: File): Promise<string | null> {
    const token = await StorageService.getAuthToken();
    if (!token) return null;

    const url = this.buildUrl("/profile/upload");
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    return data.success ? data.url : null;
  }

  // ------------------------------------------------------------
  // ⭐ uploadAvatar
  // ------------------------------------------------------------
  static async uploadAvatar(file: File): Promise<string | null> {
    const userId = await StorageService.getUserId();
    if (!userId) return null;

    const url = this.buildUrl("/identity/uploadAvatar");

    const form = new FormData();
    form.append("userId", userId.toString());
    form.append("avatar", file);

    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    return data.success ? data.avatarUrl : null;
  }

  // ------------------------------------------------------------
  // ⭐ ABORT PENDING MESSAGE
  // ------------------------------------------------------------
  static async abortPendingMessage(messageId: string) {
    await this.post("/messages/abort", { messageId });
  }

  // ------------------------------------------------------------
  // ⭐ ALIAS: CERCA UTENTE
  // ------------------------------------------------------------
  static async searchAlias(alias: string) {
    return (await this.get(`/alias/search?alias=${alias}`)) ?? {
      exists: false,
    };
  }

  // ------------------------------------------------------------
  // ⭐ ALIAS: INVIA RICHIESTA
  // ------------------------------------------------------------
  static async sendAliasRequest(fromAlias: string, toAlias: string) {
    return (
      (await this.post("/alias/request", { fromAlias, toAlias })) ?? {
        success: false,
      }
    );
  }

  // ------------------------------------------------------------
  // ⭐ ALIAS: ACCETTA
  // ------------------------------------------------------------
  static async acceptAliasRequest(fromAlias: string, toAlias: string) {
    const res = await this.post("/alias/accept", { fromAlias, toAlias });
    return res?.success === true;
  }

  // ------------------------------------------------------------
  // ⭐ ALIAS: RIFIUTA
  // ------------------------------------------------------------
  static async rejectAliasRequest(fromAlias: string, toAlias: string) {
    const res = await this.post("/alias/reject", { fromAlias, toAlias });
    return res?.success === true;
  }

  // ------------------------------------------------------------
  // ⭐ ALIAS: CONTATTI
  // ------------------------------------------------------------
  static async getAliasContacts(): Promise<Record<string, any>[]> {
    const res = await this.get("/alias/contacts");
    if (!res || !res.contacts) return [];
    return res.contacts;
  }

  // ------------------------------------------------------------
  // ⭐ BLOCKLIST: BLOCCA
  // ------------------------------------------------------------
  static async blockAlias(alias: string): Promise<boolean> {
    const myAlias = await StorageService.getAlias();
    const res = await this.post("/blocklist/block", {
      blockerAlias: myAlias,
      blockedAlias: alias,
    });
    return res?.success === true;
  }

  // ------------------------------------------------------------
  // ⭐ BLOCKLIST: SBLOCCA
  // ------------------------------------------------------------
  static async unblockAlias(alias: string): Promise<boolean> {
    const myAlias = await StorageService.getAlias();
    const res = await this.post("/blocklist/unblock", {
      blockerAlias: myAlias,
      blockedAlias: alias,
    });
    return res?.success === true;
  }

  // ------------------------------------------------------------
  // ⭐ BLOCKLIST: LISTA BLOCCATI
  // ------------------------------------------------------------
  static async getBlockedList(): Promise<string[]> {
    const myAlias = await StorageService.getAlias();
    const res = await this.get(`/blocklist/blocked?alias=${myAlias}`);
    if (!res || !res.blocked) return [];
    return res.blocked;
  }

  // ------------------------------------------------------------
  // ⭐ PROFILO: /identity/me
  // ------------------------------------------------------------
  static async getProfile(): Promise<Record<string, any>> {
    const userId = await StorageService.getUserId();
    if (!userId) return {};

    const res = await this.get(`/identity/me?userId=${userId}`);
    if (!res || res.success !== true) return {};

    return res.user;
  }
}
