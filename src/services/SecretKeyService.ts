// src/services/SecretKeyService.ts

import { ApiService } from "./ApiService";

export class SecretKeyService {
  // ------------------------------------------------------------
  // SALVA K_MSG NEL BACKEND
  // ------------------------------------------------------------
  static async registerSecretKey(params: {
    messageId: string;
    kmsg: Uint8Array;
    senderId: number;
    recipients: { [key: string]: string }[];
  }): Promise<boolean> {
    const { messageId, kmsg, senderId, recipients } = params;

    const kmsgBase64 = btoa(String.fromCharCode(...kmsg));

    const res = await ApiService.registerSecretMessage({
      messageId,
      kmsg: kmsgBase64,
      senderId,
      recipients: recipients.map(r => ({
        userId: r.userId ?? r.id ?? r.otherId ?? r.recipientId
      })),
    });

    return res;
  }

  // ------------------------------------------------------------
  // RECUPERA K_MSG DAL BACKEND
  // ------------------------------------------------------------
  static async fetchSecretKey(messageId: string): Promise<Uint8Array | null> {
    console.log("🔍 [DEBUG] Richiesta KMSG per messageId:", messageId);

    const kmsgBase64 = await ApiService.fetchKmsg(messageId);

    console.log("🔍 [DEBUG] Risposta ApiService.fetchKmsg →", kmsgBase64);

    if (!kmsgBase64) {
      console.log("❌ [DEBUG] Nessuna KMSG trovata nel backend");
      return null;
    }

    try {
      const decodedStr = atob(kmsgBase64);
      const decodedBytes = new Uint8Array(
        [...decodedStr].map((c) => c.charCodeAt(0))
      );

      console.log(
        "✅ [DEBUG] Decodifica base64 OK, lunghezza:",
        decodedBytes.length
      );

      return decodedBytes;
    } catch (e) {
      console.log("❌ [DEBUG] Errore decodifica base64:", e);
      return null;
    }
  }
}
