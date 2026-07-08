// src/services/SecretDownloadService.ts

export class SecretDownloadItem {
  sessionId: string;
  fromUserId: number;
  fileName: string;
  fileType: string;
  fileSize: number;

  progress: number; // 0 → 100
  status: string;   // waiting, downloading, completed, error
  filePath?: string;

  constructor(params: {
    sessionId: string;
    fromUserId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    progress?: number;
    status?: string;
    filePath?: string;
  }) {
    this.sessionId = params.sessionId;
    this.fromUserId = params.fromUserId;
    this.fileName = params.fileName;
    this.fileType = params.fileType;
    this.fileSize = params.fileSize;

    this.progress = params.progress ?? 0;
    this.status = params.status ?? "waiting";
    this.filePath = params.filePath;
  }
}

export class SecretDownloadService {
  private static _instance: SecretDownloadService | null = null;
  static get instance(): SecretDownloadService {
    if (!this._instance) this._instance = new SecretDownloadService();
    return this._instance;
  }

  private constructor() {}

  // ⭐ Event channel per notificare la UI
  private channel = new BroadcastChannel("wink-secret-download");

  private itemsMap: Record<string, SecretDownloadItem> = {};

  // ⭐ LISTENERS PER LA UI
  private listeners: Array<() => void> = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
  }

  unsubscribe(callback: () => void) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  // ============================================================
  // GETTERS
  // ============================================================
  get items(): SecretDownloadItem[] {
    return Object.values(this.itemsMap).sort((a, b) =>
      a.sessionId.localeCompare(b.sessionId)
    );
  }

  exists(sessionId: string): boolean {
    return !!this.itemsMap[sessionId];
  }

  getFileName(sessionId: string): string {
    return this.itemsMap[sessionId]?.fileName ?? "unknown_file";
  }

  getItem(sessionId: string): SecretDownloadItem | undefined {
    return this.itemsMap[sessionId];
  }

  // ============================================================
  // ADD INCOMING FILE (DESTINATARIO)
  // ============================================================
  addIncoming(params: {
    sessionId: string;
    fromUserId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
  }): void {
    if (this.itemsMap[params.sessionId]) return;

    this.itemsMap[params.sessionId] = new SecretDownloadItem({
      sessionId: params.sessionId,
      fromUserId: params.fromUserId,
      fileName: params.fileName,
      fileType: params.fileType,
      fileSize: params.fileSize,
    });

    this.emit();
  }

  // ============================================================
  // UPDATE PROGRESS
  // ============================================================
  updateProgress(sessionId: string, percent: number): void {
    const item = this.itemsMap[sessionId];
    if (!item) return;

    item.progress = percent * 100;
    item.status = "downloading";

    this.emit();
  }

  // ============================================================
  // MARK COMPLETED
  // ============================================================
  markCompleted(sessionId: string, filePath: string): void {
    const item = this.itemsMap[sessionId];
    if (!item) return;

    item.progress = 100;
    item.status = "completed";
    item.filePath = filePath;

    this.emit();
  }

  // ============================================================
  // MARK ERROR
  // ============================================================
  markError(sessionId: string): void {
    const item = this.itemsMap[sessionId];
    if (!item) return;

    item.status = "error";

    this.emit();
  }

  // ============================================================
  // REMOVE (cleanup)
  // ============================================================
  remove(sessionId: string): void {
    delete this.itemsMap[sessionId];
    this.emit();
  }

  // ============================================================
  // EMIT EVENT TO UI
  // ============================================================
  private emit(): void {
    this.channel.postMessage({
      type: "update",
      items: this.items,
    });

    // 🔥 Notifica i listener React
    for (const cb of this.listeners) cb();
  }
}
