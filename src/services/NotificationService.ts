// src/services/NotificationService.ts

import { StorageService } from "./StorageService";
import { ApiService } from "./ApiService";

// ⭐ NotificationType compatibile con erasableSyntaxOnly
export type NotificationType =
  | "info"
  | "warning"
  | "success"
  | "error";

export const NotificationType = {
  info: "info",
  warning: "warning",
  success: "success",
  error: "error",
} as const;

export class NotificationService {
  static readonly instance = new NotificationService();

  private constructor() {
    this.listenToFcmStream();
  }

  // ⭐ Stream FCM (web)
  static readonly fcmStream = new BroadcastChannel("wink-fcm-stream");

  // ⭐ Notifiche interne
  private notifications: Record<string, any>[] = [];

  // ⭐ Listener React
  private listeners: Set<() => void> = new Set();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
  }

  unsubscribe(fn: () => void) {
    this.listeners.delete(fn);
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => n.status === "pending").length;
  }
  
  public getNotifications(): Record<string, any>[] {
    return this.notifications;
  }
  
  public get all(): Record<string, any>[] {
  return this.notifications;
}

  // ------------------------------------------------------------
  // CARICA NOTIFICHE DA STORAGE
  // ------------------------------------------------------------
  async loadNotifications(): Promise<void> {
    const saved = await StorageService.loadNotifications();
    this.notifications = [...saved];
    this.notify();
  }

  // ------------------------------------------------------------
  // AGGIUNGI NOTIFICA
  // ------------------------------------------------------------
  async addNotification(n: Record<string, any>): Promise<void> {
    this.notifications.push(n);
    await StorageService.saveNotifications(this.notifications);
    this.notify();
  }

  // ------------------------------------------------------------
  // AGGIORNA STATO
  // ------------------------------------------------------------
  async updateStatus(id: string, status: string): Promise<void> {
    for (const n of this.notifications) {
      if (n.id === id) {
        n.status = status;
      }
    }
    await StorageService.saveNotifications(this.notifications);
    this.notify();
  }

  // ------------------------------------------------------------
  // RIMUOVI NOTIFICA
  // ------------------------------------------------------------
  async removeNotification(n: Record<string, any>): Promise<void> {
    this.notifications = this.notifications.filter((x) => x !== n);
    await StorageService.saveNotifications(this.notifications);
    this.notify();
  }

  // ------------------------------------------------------------
  // NOTIFICA INTERNA
  // ------------------------------------------------------------
  async addInternalNotification(params: {
    title: string;
    message: string;
    type?: NotificationType;
  }): Promise<void> {
    const notif = {
      id: Date.now().toString(),
      title: params.title,
      message: params.message,
      type: params.type ?? NotificationType.info,
      status: "pending",
      timestamp: Date.now(),
    };

    this.notifications.push(notif);
    await StorageService.saveNotifications(this.notifications);
    this.notify();
  }

  // ------------------------------------------------------------
  // NOTIFICA: GALLERY PIENA
  // ------------------------------------------------------------
  async notifyGalleryFull(): Promise<void> {
    await this.addInternalNotification({
      title: "WinkGallery piena",
      message:
        "La tua WinkGallery ha superato 1 GB. Aprila per eliminare i file indesiderati.",
      type: NotificationType.warning,
    });
  }

  // ------------------------------------------------------------
  // ALIAS REALTIME
  // ------------------------------------------------------------
  async addAliasNotification(data: Record<string, any>): Promise<void> {
    const type = data.type;

    if (type === "alias_request_received") {
      await this.addInternalNotification({
        title: "Richiesta alias",
        message: `${data.alias} vuole aggiungerti`,
        type: NotificationType.info,
      });
    }

    if (type === "alias_request_accepted") {
      await this.addInternalNotification({
        title: "Richiesta alias accettata",
        message: `${data.alias} ora è nei tuoi contatti`,
        type: NotificationType.success,
      });
    }

    if (type === "alias_request_rejected") {
      await this.addInternalNotification({
        title: "Richiesta alias rifiutata",
        message: `${data.alias} ha rifiutato la tua richiesta`,
        type: NotificationType.warning,
      });
    }
  }

  // ------------------------------------------------------------
  // LISTENER FCM (WEB)
  // ------------------------------------------------------------
  private listenToFcmStream(): void {
    NotificationService.fcmStream.onmessage = async (ev) => {
      const data = ev.data;
      const type = data.type;

      if (type === "encrypted_png") {
        const fileId = data.fileId;
        const fileName = data.fileName;
        const senderId = data.senderId ?? "";
        const senderName = data.senderName ?? "";
        const timestamp = data.timestamp ?? "";

        await StorageService.saveReceivedFileMetadata({
          fileId,
          fileName,
          senderId,
          senderName,
          timestamp,
        });

        try {
          await ApiService.downloadEncryptedFile(fileId);

          await this.addInternalNotification({
            title: "File ricevuto",
            message: `${fileName} ricevuto`,
            type: NotificationType.success,
          });
        } catch (e) {
          console.error("❌ Errore salvataggio PNG:", e);
        }
      }
    };
  }
}
