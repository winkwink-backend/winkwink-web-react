// src/services/MessagesService.ts

import { ApiService } from "./ApiService";

export class MessagesService {
  // ============================================================
  // ⭐ CHAT PERSISTENTE (NUOVO SISTEMA)
  // ============================================================

  // ⭐ Recupera i messaggi di una chat tramite chatId
  static async getChatMessages(chatId: number): Promise<Record<string, any>[]> {
    try {
      const data = await ApiService.get(`/chat/messages/${chatId}`);
      return Array.isArray(data?.messages)
        ? [...data.messages]
        : [];
    } catch {
      return [];
    }
  }

  // ⭐ Invia un messaggio persistente tramite chatId
  static async sendChatMessage(
    chatId: number,
    senderId: number,
    content: string
  ): Promise<boolean> {
    try {
      await ApiService.post("/chat/send", {
        chat_id: chatId,
        sender_id: senderId,
        content,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================
  // ⭐ CONVERSAZIONI (LISTA CHAT)
  // ============================================================

  // ⭐ Recupera la lista delle conversazioni dell’utente
  static async getConversations(
    userId: number
  ): Promise<Record<string, any>[]> {
    try {
      const data = await ApiService.get(`/conversations/${userId}`);
      return Array.isArray(data?.conversations)
        ? [...data.conversations]
        : [];
    } catch {
      return [];
    }
  }

  // ============================================================
  // ⭐ VECCHIO SISTEMA (ANCORA SUPPORTATO PER COMPATIBILITÀ)
  // ============================================================

  // ⭐ Recupera i messaggi tra due utenti (vecchio sistema)
  static async getMessages(
    userId: number,
    otherId: number
  ): Promise<Record<string, any>[]> {
    try {
      const data = await ApiService.get(`/messages/${userId}/${otherId}`);
      return Array.isArray(data?.messages)
        ? [...data.messages]
        : [];
    } catch {
      return [];
    }
  }

  // ============================================================
  // ⭐ INBOX (INVITI, NOTIFICHE)
  // ============================================================

  // ⭐ Recupera inbox (notifiche)
  static async getInbox(userId: number): Promise<Record<string, any>[]> {
    try {
      const data = await ApiService.get(`/inbox/${userId}`);
      return Array.isArray(data?.inbox)
        ? [...data.inbox]
        : [];
    } catch {
      return [];
    }
  }
}
