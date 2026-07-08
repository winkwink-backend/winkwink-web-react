// src/services/WWGalleryService.ts

export class WWGalleryService {
  // Nel web non esiste una cartella pubblica come Android.
  // Restituiamo un Blob URL che la UI può scaricare o salvare.
  static async saveStegoPng(params: {
    bytes: Uint8Array;
    fileName: string;
  }): Promise<string> {
    const { bytes, fileName } = params;

    // ⭐ Creiamo un Blob PNG
    const blob = new Blob([new Uint8Array(bytes)], { type: "image/png" });

    // ⭐ Generiamo un URL temporaneo
    const url = URL.createObjectURL(blob);

    // ⭐ La UI può:
    // - scaricare il file
    // - salvarlo nella galleria browser
    // - copiarlo in IndexedDB
    // - mostrarlo come immagine

    console.log("📁 PNG stego generato (web):", fileName, url);

    return url;
  }
}
