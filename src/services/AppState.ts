// src/services/AppState.ts

import type { WWContact } from "../models/WWContact";
import { wwContactFromJson } from "../models/WWContact";

import type { AliasContact } from "../models/AliasContact";
import { ApiService } from "./ApiService";
import { StorageService } from "./StorageService";
import { SignalingService } from "./SignalingService";


export class AppState {
  // ------------------------------------------------------------
  // DATI GLOBALI
  // ------------------------------------------------------------
  static currentUser: Record<string, any> | null = null;

  static allContacts: Record<string, any>[] = [];
  static wwContacts: WWContact[] = [];
  static chats: Record<string, any>[] = [];

  // ⭐ CONTATTI ALIAS
  static aliasContacts: AliasContact[] = [];

  // ⭐ IL MIO ALIAS PUBBLICO
  static myAlias: string = "";

  static initialized: boolean = false;
  static selectedContact: WWContact | null = null;

  // ------------------------------------------------------------
  // RESET COMPLETO
  // ------------------------------------------------------------
  static reset() {
    this.currentUser = null;
    this.allContacts = [];
    this.wwContacts = [];
    this.aliasContacts = [];
    this.chats = [];
    this.myAlias = "";
    this.initialized = false;
  }

  // ------------------------------------------------------------
  // ⭐ CARICA ALIAS E CONTATTI ALIAS DA STORAGE
  // ------------------------------------------------------------
  static async loadAliasData() {
    const alias = await StorageService.getAlias();
    if (alias) {
      this.myAlias = alias;
    }

    this.aliasContacts = await StorageService.getAliasContacts();
  }

  // ------------------------------------------------------------
  // ⭐ AGGIORNA O AGGIUNGE UN CONTATTO ALIAS
  // ------------------------------------------------------------
  static async addOrUpdateAliasContact(c: AliasContact) {
    const index = this.aliasContacts.findIndex(
      (x) => x.userId === c.userId
    );

    if (index >= 0) {
      this.aliasContacts[index] = c;
    } else {
      this.aliasContacts.push(c);
    }

    await StorageService.saveAliasContacts(this.aliasContacts);
  }

  // ------------------------------------------------------------
  // ⭐ SYNC COMPLETO (ChatListPage v2)
  // ------------------------------------------------------------
  static async syncAll(): Promise<Record<string, any>> {
    if (!this.currentUser) {
      throw new Error(
        "AppState.currentUser è null — impossibile fare syncAll()"
      );
    }

    const userId = this.currentUser["id"];

    // ⭐ ASSICURIAMO LA CONNESSIONE WEBSOCKET
    if (!SignalingService.instance.isConnected) {
      console.debug(
        `🔌 [AppState] Connecting WebSocket for userId=${userId}`
      );
      await SignalingService.instance.connect(userId);
    } else {
      console.debug(
        `🔌 [AppState] WebSocket already connected as ${SignalingService.instance.myUserId}`
      );
    }

    // 🔥 Chiama il backend /contacts/sync
    const response = await ApiService.post("/contacts/sync", {
      phones: this.allContacts.map((c) => c.phone),
      userId,
      originalNames: Object.fromEntries(
        this.allContacts.map((c) => [
          c.phone.replace("+", ""),
          c.name,
        ])
      ),
    });

    // ------------------------------------------------------------
    // AGGIORNA STATO GLOBALE
    // ------------------------------------------------------------
    this.allContacts = [...response.all_contacts];

    this.wwContacts = response.ww_contacts.map((c: any) =>
      wwContactFromJson(c)
    );

    this.chats = [...response.chats];

    this.currentUser = response.current_user;

    this.initialized = true;

    return response;
  }
}
