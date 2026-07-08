// src/services/MessageEncryptService.ts

export type EncryptedResult = {
  encrypted: Uint8Array;
  key: Uint8Array;
};

export class MessageEncryptService {
  // ------------------------------------------------------------
  // CIFRA IL BUNDLE (AES‑GCM 256)
  // ------------------------------------------------------------
  static async encryptBundle(data: Uint8Array): Promise<EncryptedResult> {
  // 🔥 Converti in Uint8Array nativo per evitare SharedArrayBuffer
  const nativeData = new Uint8Array(data);

  // 32 byte key
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));

  // 12 byte nonce
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    cryptoKey,
    nativeData   // <‑‑ ora è compatibile con BufferSource
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // AES‑GCM output = cipherText + 16‑byte tag
  const cipherText = encryptedBytes.slice(0, encryptedBytes.length - 16);
  const mac = encryptedBytes.slice(encryptedBytes.length - 16);

  // combined = nonce | cipherText | mac
  const combined = new Uint8Array(nonce.length + cipherText.length + mac.length);
  combined.set(nonce, 0);
  combined.set(cipherText, nonce.length);
  combined.set(mac, nonce.length + cipherText.length);

  return {
    encrypted: combined,
    key: keyBytes,
  };
}


  // ------------------------------------------------------------
  // DECIFRA IL BUNDLE
  // ------------------------------------------------------------
  static async decryptBundle(
    encrypted: Uint8Array,
    keyBytes: Uint8Array
  ): Promise<Uint8Array> {
    const nonce = encrypted.slice(0, 12);
    const mac = encrypted.slice(encrypted.length - 16);
    const cipherText = encrypted.slice(12, encrypted.length - 16);

    // AES‑GCM expects cipherText + tag concatenated
    const full = new Uint8Array(cipherText.length + mac.length);
    full.set(cipherText, 0);
    full.set(mac, cipherText.length);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(keyBytes),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      full
    );

    return new Uint8Array(decryptedBuffer);
  }
}
