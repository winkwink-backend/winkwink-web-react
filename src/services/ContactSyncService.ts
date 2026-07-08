// src/services/ContactSyncService.ts

import { AppConfig } from "../config/AppConfig";
import type { WWContact } from "../models/WWContact";
import { wwContactFromJson } from "../models/WWContact";
import { StorageService } from "./StorageService";
import { ApiService } from "./ApiService";

export type ContactSyncResult = {
  allContacts: Record<string, any>[];
  wwContacts: WWContact[];
  chats: Record<string, any>[];
  currentUser: Record<string, any> | null;
};

export class ContactSyncService {
  // ============================================================
  // ⭐ Normalizzazione numeri
  // ============================================================
  private static normalizePhone(raw: string): string {
    let p = raw.replace(/\D/g, "");
    if (!p.startsWith("39")) p = "39" + p;
    return "+" + p;
  }

  // ============================================================
  // ⭐ CREA CHAT
  // ============================================================
  static async createChat(user1: number, user2: number) {
    const res = await fetch(`${AppConfig.baseUrl}/chat/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1, user2 }),
    });

    if (!res.ok) return null;
    return await res.json();
  }

  // ============================================================
  // ⭐ OTTIENE O CREA CHAT
  // ============================================================
  static async getOrCreateChat(myId: number, otherId: number) {
    try {
      const list = await ApiService.get(`/chat/list/${myId}`);

      if (list?.chats) {
        const chats = list.chats as Record<string, any>[];

        const existing = chats.find((c) => c.other_id === otherId);
        if (existing) {
          return { chat_id: existing.chat_id };
        }
      }

      const created = await this.createChat(myId, otherId);
      if (!created) return null;

      return { chat_id: created.chat_id };
    } catch {
      return null;
    }
  }

  // ============================================================
  // ⭐ SYNC SOLO LE CHAT
  // ============================================================
  static async syncChatsOnly(userId: number) {
    try {
      const res = await ApiService.get(`/chat/list/${userId}`);
      if (!res) return null;
      if (!res.chats) return [];
      return [...res.chats];
    } catch {
      return null;
    }
  }

  // ============================================================
  // ⭐ SYNC COMPLETO CONTATTI + CHAT (VERSIONE WEB)
  // ============================================================
  static async syncContacts(): Promise<ContactSyncResult> {
    // ⚠️ WEB: non possiamo leggere i contatti del telefono
    // → restituiamo lista vuota
    const all: Record<string, any>[] = [];
    const phones: string[] = [];
    const originalNames: Record<string, string> = {};

    // ⭐ ID UTENTE
    const userId = await StorageService.getUserId();

    let ww: WWContact[] = [];
    let chats: Record<string, any>[] = [];
    let user: Record<string, any> | null = null;

    try {
      const res = await fetch(`${AppConfig.baseUrl}/contacts/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phones,
          userId,
          originalNames,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        ww = (data.ww_contacts ?? []).map((e: any) =>
          wwContactFromJson(e)
        );

        chats = [...(data.chats ?? [])];
        user = data.current_user ?? null;
      }
    } catch {
      // ignore
    }

    // Salvataggio locale
    await StorageService.saveContacts(all);
    for (const c of ww) {
      await StorageService.saveOrUpdateWWContact(c);
    }

    return {
      allContacts: all,
      wwContacts: ww,
      chats,
      currentUser: user,
    };
  }
}
