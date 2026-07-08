// src/services/MessageBundleService.ts

export class MessageBundleService {
  static createBundle(params: {
    secret: Record<string, any>;
    fileName: string;
    recipients: { [key: string]: string }[];
  }): Uint8Array {
    const { secret, fileName, recipients } = params;

    const bundle = {
      fileName,
      secret,
      recipients,
      timestamp: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(bundle);
    return new TextEncoder().encode(jsonStr);
  }
}
