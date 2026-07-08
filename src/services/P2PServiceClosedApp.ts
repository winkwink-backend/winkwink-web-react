// src/services/P2PServiceClosedApp.ts

import { AppConfig } from "../config/AppConfig";
import type { WWContact } from "../models/WWContact";
import { StorageService } from "./StorageService";


export class P2PServiceClosedApp {
  private constructor() {}
  static readonly instance = new P2PServiceClosedApp();

  // ============================================================
  // HTTP UTILS
  // ============================================================
  private buildUrl(path: string): string {
    if (!path.startsWith("/")) path = "/" + path;
    return `${AppConfig.baseUrl}${path}`;
  }

  private async safePost(path: string, body: any): Promise<any> {
    const url = this.buildUrl(path);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      try {
        return await res.json();
      } catch {
        return {};
      }
    }

    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  // ============================================================
  // 1️⃣ CREA SESSIONE (solo metadati)
  // ============================================================
  async createSession(params: {
    fromUserId: number;
    toUserId: number;
    fileSize: number;
    fileType: string;
    fileName: string;
  }): Promise<string> {
    console.log("[WW_HTTP] Calling /p2p/session/init ...");

    const res = await this.safePost("/p2p/session/init", {
      from_user_id: params.fromUserId,
      to_user_id: params.toUserId,
      fileSize: params.fileSize,
      fileType: params.fileType,
      fileName: params.fileName,
    });

    const sessionId = res.sessionId;
    if (!sessionId) {
      throw new Error("Sessione non valida dal backend");
    }

    return String(sessionId);
  }

  // ============================================================
  // 2️⃣ UPLOAD FILE FISICO SUL SERVER (multipart)
  // ============================================================
  async uploadFileToServer(params: {
    sessionId: string;
    file: File;
    fromUserId: number;
    toUserId: number;
    fileSize: number;
    fileType: string;
    fileName: string;
  }): Promise<void> {
    console.log(`[WW_HTTP] Upload file to /p2p/session/create/${params.sessionId} ...`);

    const url = this.buildUrl(`/p2p/session/create/${params.sessionId}`);

    const form = new FormData();
    form.append("from_user_id", String(params.fromUserId));
    form.append("to_user_id", String(params.toUserId));
    form.append("fileSize", String(params.fileSize));
    form.append("fileType", params.fileType);
    form.append("fileName", params.fileName);
    form.append("file", params.file);

    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    const body = await res.text();
    console.log(`[WW_HTTP] Upload response: ${res.status} ${body}`);

    if (!res.ok) {
      throw new Error(`Upload fallito: ${res.status}`);
    }
  }

  // ============================================================
  // 3️⃣ INVIO FILE (FLUSSO COMPLETO APP CHIUSA)
  // ============================================================
  async sendFileToUser(params: {
    contact: WWContact;
    file: File;
    fileType: string;
    fileName: string;
    senderId: string;
  }): Promise<void> {
    console.log("[WW_FILE] SEND FILE (APP CHIUSA) pressed");

    const fromUserId = await StorageService.getUserId();
    if (!fromUserId) throw new Error("UserId locale mancante");

    const toUserId = Number(params.contact.peerId);
    const fileSize = params.file.size;

    // 1️⃣ CREA SESSIONE
    const sessionId = await this.createSession({
      fromUserId,
      toUserId,
      fileSize,
      fileType: params.fileType,
      fileName: params.fileName,
    });

    console.log("[WW_HTTP] Session created:", sessionId);

    // 2️⃣ UPLOAD FILE
    await this.uploadFileToServer({
      sessionId,
      file: params.file,
      fromUserId,
      toUserId,
      fileSize,
      fileType: params.fileType,
      fileName: params.fileName,
    });

    console.log("[WW_HTTP] File uploaded to server");
    console.log("[WW_HTTP] FCM inviato dal server → attesa ACCETTA sul device ricevente");
  }
}
