// src/services/UploadService.ts

export class UploadService {
  static async uploadFile(file: File): Promise<string | null> {
    const url =
      "https://winkwink-backend1-production.up.railway.app/chat/upload";

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      return null;
    }

    const body = await res.text();
    return body; // deve restituire l’URL del file
  }
}
