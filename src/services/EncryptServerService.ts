// src/services/EncryptServerService.ts

import { AppConfig } from "../config/AppConfig";

export class EncryptServerService {
  private constructor() {}
  static readonly instance = new EncryptServerService();

  // ⭐ Carica un file PNG stego criptato al server
  async uploadEncryptedPng(params: {
    receiverId: string;
    senderId: string;
    file: File;
    fileName: string;
  }): Promise<void> {
    const { receiverId, senderId, file, fileName } = params;

    const url = `${AppConfig.baseUrl}/encrypt/upload`;

    const form = new FormData();
    form.append("receiverId", receiverId);
    form.append("senderId", senderId);
    form.append("fileName", fileName);
    form.append("file", file);

    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error("Errore upload file PNG cifrato");
    }
  }
}
