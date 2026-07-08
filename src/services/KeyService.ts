// src/services/KeyService.ts

import { StorageService } from "./StorageService";
import { PNG } from "pngjs";

// ------------------------------------------------------------
// ⭐ KeyService per WinkWink Web
// ------------------------------------------------------------
export class KeyService {
  // Singleton
  static instance = new KeyService();

  // ------------------------------------------------------------
  // ⭐ GENERA LA CHIAVE DI RECUPERO (seed)
  // ------------------------------------------------------------
  async generateKeys(): Promise<void> {
    // 1) Genera 32 byte casuali
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    // 2) Converti in Base64
    const key = btoa(String.fromCharCode(...bytes));

    // 3) Salva come "universal_key"
    await StorageService.saveUniversalKey(key);
  }

  // ------------------------------------------------------------
  // ⭐ ESPORTA LA CHIAVE IN PNG (per download)
  // ------------------------------------------------------------
  async exportKeyAsPng(): Promise<Uint8Array> {
    const key = await StorageService.getUniversalKey();
    if (!key) throw new Error("Universal key non trovata");

    const encoded = new TextEncoder().encode(key);

    // PNG 1xN con i byte della chiave
    const png = new PNG({
      width: encoded.length,
      height: 1,
    });

    for (let x = 0; x < encoded.length; x++) {
      const v = encoded[x];
      const idx = (x << 2); // pixel (x,0)
      png.data[idx] = v;     // R
      png.data[idx + 1] = v; // G
      png.data[idx + 2] = v; // B
      png.data[idx + 3] = 255; // A
    }

    return PNG.sync.write(png);
  }

  // ------------------------------------------------------------
  // ⭐ IMPORTA LA CHIAVE DA PNG (per RecoverAccountPage)
  // ------------------------------------------------------------
  async importKeyFromPng(pngBytes: Uint8Array): Promise<string> {
    const png = PNG.sync.read(Buffer.from(pngBytes));

    const bytes: number[] = [];

    for (let x = 0; x < png.width; x++) {
      const idx = (x << 2); // pixel (x,0)
      const r = png.data[idx]; // canale R
      bytes.push(r);
    }

    const key = new TextDecoder().decode(new Uint8Array(bytes));
    return key;
  }
}
