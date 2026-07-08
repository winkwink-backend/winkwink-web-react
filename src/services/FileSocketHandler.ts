// src/services/FileSocketHandler.ts

import { Socket } from "socket.io-client";

export class FileSocketHandler {
  private socket: Socket | null;

  constructor(socket: Socket | null) {
    this.socket = socket;
  }

  // ============================================================
  // CALLBACKS ESTERNE
  // ============================================================
  onIncomingFile?: (data: Record<string, any>) => void;
  onFileAccept?: (data: Record<string, any>) => void;
  onFileReject?: (data: Record<string, any>) => void;
  onUploadStart?: (sessionId: string) => void;
  onCheckFolderRequest?: (data: Record<string, any>) => void;
  onFolderResponseReceived?: (data: Record<string, any>) => void;

  // ============================================================
  // INIT LISTENERS
  // ============================================================
  initListeners() {
    if (!this.socket) return;

    // 📥 incoming_file
    this.socket.on("incoming_file", (data: any) => {
      console.debug("📥 [SOCKET] incoming_file →", data);
      if (data && typeof data === "object") {
        this.onIncomingFile?.(data);
      }
    });

    // ✅ file_accept
    this.socket.on("file_accept", (data: any) => {
      console.debug("✅ [SOCKET] file_accept →", data);
      if (data && typeof data === "object") {
        this.onFileAccept?.(data);
      }
    });

    // ❌ file_reject
    this.socket.on("file_reject", (data: any) => {
      console.debug("❌ [SOCKET] file_reject →", data);
      if (data && typeof data === "object") {
        this.onFileReject?.(data);
      }
    });

    // 📂 check_folder_request
    this.socket.on("check_folder_request", (data: any) => {
      console.debug("📂 [SOCKET] check_folder_request →", data);
      if (data && typeof data === "object") {
        this.onCheckFolderRequest?.(data);
      }
    });

    // 📂 folder_response
    this.socket.on("folder_response", (data: any) => {
      console.debug("📂 [SOCKET] folder_response →", data);
      if (data && typeof data === "object") {
        this.onFolderResponseReceived?.(data);
      }
    });

    // 🚀 upload_start
    this.socket.on("upload_start", (data: any) => {
      console.debug("🚀 [SOCKET] upload_start →", data);
      if (data && typeof data === "object" && data.sessionId) {
        this.onUploadStart?.(String(data.sessionId));
      }
    });
  }
}
