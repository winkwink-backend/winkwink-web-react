// src/services/DecryptLogic.ts

import type { DecryptResult } from "../models/DecryptResult";
import type { DecryptedFile } from "../models/DecryptedFile";

import { SecretKeyService } from "./SecretKeyService";
import { MessageEncryptService } from "./MessageEncryptService";

export class DecryptLogic {
  // ------------------------------------------------------------
  // ENTRYPOINT
  // ------------------------------------------------------------
  async decryptFile(url: string): Promise<DecryptResult> {
    // ⭐ Web: leggiamo il PNG via fetch
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Impossibile leggere il file PNG");
    }

    const buffer = await res.arrayBuffer();
    const fileBytes = new Uint8Array(buffer);

    // 1) Estrai chunk WINK
    const wink = this.extractWinkChunk(fileBytes);
    const messageId = wink.messageId;
    const encryptedBundle = wink.encryptedBundle;

    // 2) Recupera K_msg dal backend
    const kmsg = await SecretKeyService.fetchSecretKey(messageId);
    if (!kmsg || kmsg.length === 0) {
      throw new Error(`Chiave K_msg non trovata per messageId=${messageId}`);
    }

    // 3) Decifra bundle
    let bundleBytes: Uint8Array;
    try {
      bundleBytes = await MessageEncryptService.decryptBundle(
        encryptedBundle,
        kmsg
      );
    } catch (e: any) {
      throw new Error(`Errore decryptBundle: ${e}`);
    }

    // 4) Decodifica JSON
    let decodedJson: any;
    try {
      decodedJson = JSON.parse(new TextDecoder().decode(bundleBytes));
    } catch (e: any) {
      throw new Error(`Errore jsonDecode: ${e}`);
    }

    if (!decodedJson || !decodedJson.secret) {
      throw new Error("Bundle segreto non valido o mancante.");
    }

    const secret = decodedJson.secret as Record<string, any>;

    // 5) Converte in DecryptedFile[]
    const files = this.convertBundleToFiles(secret);

    // 6) Cover image = PNG originale
    return {
      coverImage: fileBytes,
      files,
    };
  }
   
  // ------------------------------------------------------------
  // ENTRYPOINT: decrypt da BYTES PNG (AGGIUNGI QUI)
  // ------------------------------------------------------------
  async decryptBytes(fileBytes: Uint8Array): Promise<DecryptResult> {
    // 1) Estrai chunk WINK
    const wink = this.extractWinkChunk(fileBytes);
    const messageId = wink.messageId;
    const encryptedBundle = wink.encryptedBundle;

    // 2) Recupera K_msg dal backend
    const kmsg = await SecretKeyService.fetchSecretKey(messageId);
    if (!kmsg || kmsg.length === 0) {
      throw new Error(`Chiave K_msg non trovata per messageId=${messageId}`);
    }

    // 3) Decifra bundle
    let bundleBytes: Uint8Array;
    try {
      bundleBytes = await MessageEncryptService.decryptBundle(
        encryptedBundle,
        kmsg
      );
    } catch (e: any) {
      throw new Error(`Errore decryptBundle: ${e}`);
    }

    // 4) Decodifica JSON
    let decodedJson: any;
    try {
      decodedJson = JSON.parse(new TextDecoder().decode(bundleBytes));
    } catch (e: any) {
      throw new Error(`Errore jsonDecode: ${e}`);
    }

    if (!decodedJson || !decodedJson.secret) {
      throw new Error("Bundle segreto non valido o mancante.");
    }

    const secret = decodedJson.secret as Record<string, any>;

    // 5) Converte in DecryptedFile[]
    const files = this.convertBundleToFiles(secret);

    // 6) Cover image = PNG originale
    return {
      coverImage: fileBytes,
      files,
    };
  }

  // ------------------------------------------------------------
  // ESTRAZIONE CHUNK WINK
  // ------------------------------------------------------------
  private extractWinkChunk(
    png: Uint8Array
  ): { messageId: string; encryptedBundle: Uint8Array } {
    let index = 8; // skip header PNG

    while (index < png.length) {
      const length = this.readUint32(png, index);
      const type = new TextDecoder().decode(
        png.slice(index + 4, index + 8)
      );

      if (type === "WINK") {
        const dataStart = index + 8;
        const dataEnd = dataStart + length;
        const data = png.slice(dataStart, dataEnd);

        const zeroIndex = data.indexOf(0);
        if (zeroIndex <= 0) {
          throw new Error("Formato chunk WINK non valido (messageId).");
        }

        const messageId = new TextDecoder().decode(
          data.slice(0, zeroIndex)
        );

        const bundleLength = this.readUint32(data, zeroIndex + 1);

        const encryptedBundle = data.slice(
          zeroIndex + 1 + 4,
          zeroIndex + 1 + 4 + bundleLength
        );

        return {
          messageId,
          encryptedBundle: new Uint8Array(encryptedBundle),
        };
      }

      index += 12 + length;
    }

    throw new Error("Chunk WINK non trovato nel PNG.");
  }

  private readUint32(bytes: Uint8Array, offset: number): number {
    return new DataView(bytes.buffer, offset, 4).getUint32(0);
  }

  // ------------------------------------------------------------
  // CONVERSIONE BUNDLE → FILES
  // ------------------------------------------------------------
  private convertBundleToFiles(secret: Record<string, any>): DecryptedFile[] {
    const out: DecryptedFile[] = [];
    const type = secret.type;

    // ------------------------------------------------------------
    // 1) FORMATO SANDWICH (multi-file)
    // ------------------------------------------------------------
    if (type === "sandwich" && Array.isArray(secret.payload)) {
      for (const item of secret.payload) {
        if (typeof item !== "object") continue;

        const fileType = item.type;
        const data = item.data;

        if (!Array.isArray(data)) continue;

        const bytes = new Uint8Array(data);

        out.push({
          type: fileType,
          bytes,
        });
      }

      return out;
    }

    // ------------------------------------------------------------
    // 2) FORMATI SINGOLI (retrocompatibilità)
    // ------------------------------------------------------------
    if (type === "text" && typeof secret.payload === "string") {
      out.push({
        type: "text",
        bytes: new TextEncoder().encode(secret.payload),
      });
    }

    if (type === "image" && Array.isArray(secret.bytes)) {
      out.push({
        type: "image",
        bytes: new Uint8Array(secret.bytes),
      });
    }

    if (type === "audio" && Array.isArray(secret.bytes)) {
      out.push({
        type: "audio",
        bytes: new Uint8Array(secret.bytes),
      });
    }

    if (type === "video" && Array.isArray(secret.bytes)) {
      out.push({
        type: "video",
        bytes: new Uint8Array(secret.bytes),
      });
    }

    return out;
  }

  // ------------------------------------------------------------
  // META: SOLO PER DEBUG ESTERNO (UI)
  // ------------------------------------------------------------
  async loadKmsgForPng(url: string): Promise<{
    messageId: string;
    kmsgBase64: string | null;
  }> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Impossibile leggere il file PNG");
    }

    const buffer = await res.arrayBuffer();
    const fileBytes = new Uint8Array(buffer);

    const wink = this.extractWinkChunk(fileBytes);
    const messageId = wink.messageId;

    const kmsgBytes = await SecretKeyService.fetchSecretKey(messageId);
    if (!kmsgBytes || kmsgBytes.length === 0) {
      return { messageId, kmsgBase64: null };
    }

    const kmsgBase64 = btoa(
      String.fromCharCode(...new Uint8Array(kmsgBytes))
    );

    return { messageId, kmsgBase64 };
  }

  // ------------------------------------------------------------
  // META: KMSG da bytes (equivalente Flutter loadKmsgForBytes)
  // ------------------------------------------------------------
   async loadKmsgForBytes(bytes: Uint8Array): Promise<{
     messageId: string;
     kmsgBase64: string | null;
   }> {
      // 1) Estrai chunk WINK dal PNG già in memoria
      const wink = this.extractWinkChunk(bytes);
      const messageId = wink.messageId;

      // 2) Recupera K_msg dal backend
      const kmsgBytes = await SecretKeyService.fetchSecretKey(messageId);
      if (!kmsgBytes || kmsgBytes.length === 0) {
       return { messageId, kmsgBase64: null };
      }

      // 3) Converti in Base64 per debug/UI
        const kmsgBase64 = btoa(
         String.fromCharCode(...new Uint8Array(kmsgBytes))
        );

       return { messageId, kmsgBase64 };
   }  
}
