// src/services/MessageIdService.ts

export class MessageIdService {
  static generate(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
