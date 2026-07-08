// src/services/PngEmbedService.ts

export class PngEmbedService {
  // ------------------------------------------------------------
  // EMBED CHUNK WINK NEL PNG (WEB VERSION)
  // ------------------------------------------------------------
  static async embedChunk(params: {
    pngFile: File;
    messageId: string;
    encryptedBundle: Uint8Array;
  }): Promise<File> {
    const { pngFile, messageId, encryptedBundle } = params;

    // ⭐ Leggi PNG originale
    const buffer = await pngFile.arrayBuffer();
    const original = new Uint8Array(buffer);

    if (!this.isPng(original)) {
      throw new Error("L'immagine visibile NON è un PNG valido.");
    }

    // Header PNG (8 byte)
    const header = original.slice(0, 8);

    // IHDR chunk
    let index = 8;
    const ihdrLength = this.readUint32(original, index);
    const ihdrEnd = index + 12 + ihdrLength;

    if (ihdrEnd > original.length) {
      throw new Error("PNG corrotto: IHDR fuori range.");
    }

    const ihdrChunk = original.slice(index, ihdrEnd);
    const rest = original.slice(ihdrEnd);

    // Chunk WINK
    const winkChunk = this.buildWinkChunk(messageId, encryptedBundle);

    // Nuovo PNG
    const newBytes = new Uint8Array(
      header.length + ihdrChunk.length + winkChunk.length + rest.length
    );

    newBytes.set(header, 0);
    newBytes.set(ihdrChunk, header.length);
    newBytes.set(winkChunk, header.length + ihdrChunk.length);
    newBytes.set(rest, header.length + ihdrChunk.length + winkChunk.length);

    // ⭐ Creiamo un nuovo File web
    const outName = pngFile.name.replace(/\.png$/, "_wink.png");
    return new File([newBytes], outName, { type: "image/png" });
  }

  // ------------------------------------------------------------
  // COSTRUZIONE CHUNK WINK
  // ------------------------------------------------------------
  private static buildWinkChunk(
    messageId: string,
    encrypted: Uint8Array
  ): Uint8Array {
    const type = new Uint8Array([0x57, 0x49, 0x4E, 0x4B]); // "WINK"

    const idBytes = new TextEncoder().encode(messageId);

    const bundleLength = encrypted.length;
    const bundleLenBytes = new Uint8Array(4);
    new DataView(bundleLenBytes.buffer).setUint32(0, bundleLength);

    const data = new Uint8Array(idBytes.length + 1 + 4 + encrypted.length);
    data.set(idBytes, 0);
    data[idBytes.length] = 0; // separator
    data.set(bundleLenBytes, idBytes.length + 1);
    data.set(encrypted, idBytes.length + 1 + 4);

    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, data.length);

    const crcInput = new Uint8Array(type.length + data.length);
    crcInput.set(type, 0);
    crcInput.set(data, type.length);

    const crc = this.crc32(crcInput);
    const crcBytes = new Uint8Array(4);
    new DataView(crcBytes.buffer).setUint32(0, crc);

    const out = new Uint8Array(
      lengthBytes.length + type.length + data.length + crcBytes.length
    );

    out.set(lengthBytes, 0);
    out.set(type, 4);
    out.set(data, 8);
    out.set(crcBytes, 8 + data.length);

    return out;
  }

  // ------------------------------------------------------------
  // PNG CHECK
  // ------------------------------------------------------------
  private static isPng(bytes: Uint8Array): boolean {
    if (bytes.length < 8) return false;
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  // ------------------------------------------------------------
  // READ UINT32
  // ------------------------------------------------------------
  private static readUint32(bytes: Uint8Array, offset: number): number {
    return new DataView(bytes.buffer, offset, 4).getUint32(0);
  }

  // ------------------------------------------------------------
  // CRC32
  // ------------------------------------------------------------
  private static crc32(bytes: Uint8Array): number {
    const poly = 0xedb88320;
    let crc = 0xffffffff;

    for (const b of bytes) {
      let c = crc ^ b;
      for (let i = 0; i < 8; i++) {
        c = (c & 1) ? poly ^ (c >>> 1) : c >>> 1;
      }
      crc = c;
    }

    return crc ^ 0xffffffff;
  }
}
