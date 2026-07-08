// src/models/DecryptedFile.ts

export type DecryptedFile = {
  type: string;        // "image", "video", "audio", "text"
  bytes: Uint8Array;   // equivalente web di Uint8List
};
