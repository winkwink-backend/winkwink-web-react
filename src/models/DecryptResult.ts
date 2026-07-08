// src/models/DecryptResult.ts

import type { DecryptedFile } from "./DecryptedFile";


export type DecryptResult = {
  coverImage: Uint8Array | null;
  files: DecryptedFile[];
};
