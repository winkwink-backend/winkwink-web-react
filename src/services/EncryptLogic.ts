// src/services/EncryptLogic.ts

import { MessageIdService } from "./MessageIdService";
import { MessageBundleService } from "./MessageBundleService";
import { MessageEncryptService } from "./MessageEncryptService";
import { PngEmbedService } from "./PngEmbedService";
import { EncryptServerService } from "./EncryptServerService";
import { ApiService } from "./ApiService";
import { StorageService } from "./StorageService";

export class EncryptLogic {
  static async encryptAndShare(params: {
    fileName: string;
    visibleImage: File | null;
    selectedSecret: Record<string, any> | null;
    selectedContacts: { userId: string }[];
    onProgress?: (p: number) => void;
  }): Promise<void> {
    console.log("🔵 [EncryptLogic] Avvio encryptAndShare()");
    console.log("🔵 selectedContacts =", params.selectedContacts);
    console.log("🔵 selectedSecret =", params.selectedSecret);

    const { fileName, visibleImage, selectedSecret, selectedContacts } = params;

    if (!visibleImage) {
      throw new Error("Seleziona un'immagine visibile");
    }

    if (!selectedSecret) {
      throw new Error("Seleziona un contenuto segreto");
    }

    if (selectedContacts.length === 0) {
      throw new Error("Seleziona almeno un destinatario");
    }

    if (!fileName || fileName.trim().length === 0) {
      throw new Error("Inserisci un nome per il file");
    }

    let pngVisible: File | null = null;
    let winkPng: File | null = null;
    let messageId: string | null = null;

    try {
      // 1) USER ID
      const userId = await StorageService.getUserId();
      console.log("🔵 userId =", userId);
      if (!userId) throw new Error("UserId non trovato");

      // 2) GENERA messageId
      messageId = MessageIdService.generate();
      console.log("🔵 messageId generato =", messageId);

      // 3) CONVERSIONE AUTOMATICA IN PNG
      console.log("🔵 Converto immagine in PNG...");
      pngVisible = await this.convertToPng(visibleImage);
      console.log("🟢 PNG convertito");

      // 4) CREA IL BUNDLE
      console.log("🔵 Creo bundle...");
      const bundleBytes = MessageBundleService.createBundle({
        secret: selectedSecret,
        fileName: `${messageId}.png`,
        recipients: selectedContacts,
      });
      console.log("🟢 Bundle creato", bundleBytes.length);

      // 5) CIFRA IL BUNDLE
      console.log("🔵 Cifro bundle...");
      const encrypted = await MessageEncryptService.encryptBundle(bundleBytes);
      const kmsg = encrypted.key;
      const encryptedBundle = encrypted.encrypted;
      const kmsgBase64 = btoa(String.fromCharCode(...kmsg));
      console.log("🟢 Cifratura OK");

      // 6) INCORPORA CHUNK WINK NEL PNG
      console.log("🔵 Inserisco chunk WINK...");
      winkPng = await PngEmbedService.embedChunk({
        pngFile: pngVisible,
        messageId,
        encryptedBundle,
      });
      console.log("🟢 PNG WINK creato");

      // 7) REGISTRA K_msg NEL BACKEND
      console.log("🔵 Invio registerSecretMessage...");
      const ok = await ApiService.registerSecretMessage({
        messageId,
        kmsg: kmsgBase64,
        senderId: userId,
        recipients: selectedContacts,
      });

      console.log("🟣 Risposta registerSecretMessage =", ok);

      if (!ok) {
        throw new Error("Errore registrazione chiave K_msg");
      }

      // 8) INVIA PNG AL DESTINATARIO
      const first = selectedContacts[0];
      console.log("🔵 Invio PNG a userId =", first.userId);

      await EncryptServerService.instance.uploadEncryptedPng({
        receiverId: first.userId,
        senderId: userId.toString(),
        file: winkPng,
        fileName,
      });

      console.log("🟢 Upload PNG completato");
    } catch (e: any) {
      console.error("❌ ECCEZIONE:", e);

      if (messageId) {
        console.log("🔵 Chiamo abortPendingMessage", messageId);
        await ApiService.abortPendingMessage(messageId);
      }

      throw e;
    }
  }

  // ------------------------------------------------------------
  // CONVERSIONE AUTOMATICA IN PNG (VERSIONE WEB)
  // ------------------------------------------------------------
  static async convertToPng(input: File): Promise<File> {
    const arrayBuffer = await input.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // ⭐ Web: usiamo canvas per ricodificare in PNG
    const blob = new Blob([bytes]);
    const bitmap = await createImageBitmap(blob);

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas non disponibile");

    ctx.drawImage(bitmap, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    return new File([pngBlob], input.name.replace(/\.\w+$/, ".png"), {
      type: "image/png",
    });
  }
}
