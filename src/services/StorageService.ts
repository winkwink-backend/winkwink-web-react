// src/services/StorageService.ts

import type { WWContact } from "../models/WWContact";
import type { AliasContact } from "../models/AliasContact";


export class StorageService {
  // ------------------------------------------------------------
  // 🔥 LOGIN STATE
  // ------------------------------------------------------------
  static async setLoggedIn(value: boolean): Promise<void> {
    localStorage.setItem("logged_in", JSON.stringify(value));
  }

  static async isLoggedIn(): Promise<boolean> {
    return JSON.parse(localStorage.getItem("logged_in") || "false");
  }

  // ------------------------------------------------------------
  // 🔥 PASSWORD bypass
  // ------------------------------------------------------------
  static async setBypassLock(value: boolean): Promise<void> {
    localStorage.setItem("bypassLock", JSON.stringify(value));
  }

  static getBypassLockSync(): boolean {
  return JSON.parse(localStorage.getItem("bypassLock") || "false");
 }

  // ------------------------------------------------------------
  // 🔥 PASSWORD FLAG
  // ------------------------------------------------------------
  static async setHasPassword(value: boolean): Promise<void> {
    localStorage.setItem("has_password", JSON.stringify(value));
  }

  // ------------------------------------------------------------
  // 🔥 PROFILO UTENTE
  // ------------------------------------------------------------
  static async saveProfile(params: {
    name: string;
    surname: string;
    email: string;
    password: string;
  }): Promise<void> {
    localStorage.setItem("profile_name", params.name);
    localStorage.setItem("profile_surname", params.surname);
    localStorage.setItem("profile_email", params.email);
    localStorage.setItem("profile_password", params.password);
  }

  static async getProfile(): Promise<Record<string, string | null>> {
    return {
      name: localStorage.getItem("profile_name"),
      surname: localStorage.getItem("profile_surname"),
      email: localStorage.getItem("profile_email"),
      password: localStorage.getItem("profile_password"),
    };
  }

  // ------------------------------------------------------------
  // 🔥 ALIAS
  // ------------------------------------------------------------
  static async saveAlias(alias: string): Promise<void> {
    localStorage.setItem("profile_alias", alias);
  }

  static async getAlias(): Promise<string | null> {
    return localStorage.getItem("profile_alias");
  }

  // ------------------------------------------------------------
  // 🔥 IMMAGINE PROFILO (solo URL o base64)
  // ------------------------------------------------------------
  static async saveProfileImageUrl(url: string): Promise<void> {
    localStorage.setItem("profile_image_url", url);
  }

  static async getProfileImageUrl(): Promise<string | null> {
    return localStorage.getItem("profile_image_url");
  }

  // ------------------------------------------------------------
  // 🔥 PASSWORD GATE
  // ------------------------------------------------------------
  static async savePhone(phone: string): Promise<void> {
    localStorage.setItem("profile_phone", phone);
  }

  static async saveName(name: string): Promise<void> {
    localStorage.setItem("profile_name", name);
  }

  static async saveLastName(lastName: string): Promise<void> {
    localStorage.setItem("profile_surname", lastName);
  }

  static async getPassword(): Promise<string | null> {
    return localStorage.getItem("profile_password");
  }

  // ------------------------------------------------------------
  // 🔥 QR CODE
  // ------------------------------------------------------------
  static async saveQrData(data: string): Promise<void> {
    localStorage.setItem("qr_data", data);
  }

  static async getQrData(): Promise<string | null> {
    return localStorage.getItem("qr_data");
  }

  static async clearQrData(): Promise<void> {
    localStorage.removeItem("qr_data");
  }

  // ------------------------------------------------------------
  // 🔥 UNIVERSAL KEY
  // ------------------------------------------------------------
  static async saveUniversalKey(key: string): Promise<void> {
    localStorage.setItem("universal_key", key);
  }

  static async getUniversalKey(): Promise<string | null> {
    return localStorage.getItem("universal_key");
  }

  // ------------------------------------------------------------
  // 🔥 GENERIC STRING STORAGE
  // ------------------------------------------------------------
  static async saveString(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  static async loadString(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  static async saveListString(key: string, values: string[]): Promise<void> {
    localStorage.setItem(key, JSON.stringify(values));
  }

  static async loadListString(key: string): Promise<string[] | null> {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }

  // ------------------------------------------------------------
  // 🔥 GLOBAL CONTACTS
  // ------------------------------------------------------------
  private static readonly keyGlobalContacts = "global_contacts_list";

  static async saveGlobalContacts(contacts: WWContact[]): Promise<void> {
    localStorage.setItem(
      this.keyGlobalContacts,
      JSON.stringify(contacts)
    );
  }

  static async getGlobalContacts(): Promise<WWContact[]> {
    const raw = localStorage.getItem(this.keyGlobalContacts);
    if (!raw) return [];
   return JSON.parse(raw) as WWContact[];
  }

  static async addGlobalContact(contact: WWContact): Promise<void> {
    const list = await this.getGlobalContacts();
    if (list.some((c) => c.userId === contact.userId)) return;
    list.push(contact);
    await this.saveGlobalContacts(list);
  }

  static async deleteGlobalContact(userId: string): Promise<void> {
    const list = await this.getGlobalContacts();
    const updated = list.filter((c) => c.userId !== userId);
    await this.saveGlobalContacts(updated);
  }

  // ------------------------------------------------------------
  // 🔥 GENERIC CONTACTS
  // ------------------------------------------------------------
  private static readonly keyContacts = "contacts_list";

  static async saveContacts(list: Record<string, any>[]): Promise<void> {
    localStorage.setItem(this.keyContacts, JSON.stringify(list));
  }

  static async loadContacts(): Promise<Record<string, any>[]> {
    const raw = localStorage.getItem(this.keyContacts);
    return raw ? JSON.parse(raw) : [];
  }

  // ------------------------------------------------------------
  // 🔥 WINKWINK CONTACTS
  // ------------------------------------------------------------
  private static readonly keyWWContacts = "ww_contacts_list";

  static async saveWWContacts(contacts: WWContact[]): Promise<void> {
    localStorage.setItem(
      this.keyWWContacts,
      JSON.stringify(contacts)
    );
  }

  static async getWWContacts(): Promise<WWContact[]> {
    const raw = localStorage.getItem(this.keyWWContacts);
    if (!raw) return [];
     return JSON.parse(raw) as WWContact[];
  }

  static async saveOrUpdateWWContact(contact: WWContact): Promise<void> {
    const list = await this.getWWContacts();
    const index = list.findIndex((c) => c.userId === contact.userId);
    if (index >= 0) list[index] = contact;
    else list.push(contact);
    await this.saveWWContacts(list);
  }

  static async deleteContact(userId: string): Promise<void> {
    const list = await this.getWWContacts();
    const updated = list.filter((c) => c.userId !== userId);
    await this.saveWWContacts(updated);
  }

  // ------------------------------------------------------------
  // 🔥 ALIAS CONTACTS
  // ------------------------------------------------------------
  private static readonly keyAliasContacts = "alias_contacts_list";

  static async saveAliasContacts(list: AliasContact[]): Promise<void> {
    localStorage.setItem(
      this.keyAliasContacts,
      JSON.stringify(list)
    );
  }

  static async getAliasContacts(): Promise<AliasContact[]> {
    const raw = localStorage.getItem(this.keyAliasContacts);
    if (!raw) return [];
    return JSON.parse(raw) as AliasContact[];
  }

  static async addOrUpdateAliasContact(contact: AliasContact): Promise<void> {
    const list = await this.getAliasContacts();
    const index = list.findIndex((c) => c.userId === contact.userId);
    if (index >= 0) list[index] = contact;
    else list.push(contact);
    await this.saveAliasContacts(list);
  }

  static async deleteAliasContact(userId: string): Promise<void> {
    const list = await this.getAliasContacts();
    const updated = list.filter((c) => c.userId !== userId);
    await this.saveAliasContacts(updated);
  }

  // ------------------------------------------------------------
  // 🔥 SETTINGS BOOL
  // ------------------------------------------------------------
  static async getBool(key: string): Promise<boolean | null> {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }

  static async setBool(key: string, value: boolean): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ------------------------------------------------------------
  // 🔥 NOTIFICHE
  // ------------------------------------------------------------
  static async saveNotifications(list: Record<string, any>[]): Promise<void> {
    localStorage.setItem("notifications", JSON.stringify(list));
  }

  static async loadNotifications(): Promise<Record<string, any>[]> {
    const raw = localStorage.getItem("notifications");
    return raw ? JSON.parse(raw) : [];
  }

  // ------------------------------------------------------------
  // 🔥 RECEIVED FILE METADATA
  // ------------------------------------------------------------
  private static readonly receivedFilesKey = "received_files";

  static async saveReceivedFileMetadata(item: Record<string, any>): Promise<void> {
    const list = await this.getReceivedFiles();
    list.push(item);
    localStorage.setItem(this.receivedFilesKey, JSON.stringify(list));
  }

  static async getReceivedFiles(): Promise<Record<string, any>[]> {
    const raw = localStorage.getItem(this.receivedFilesKey);
    return raw ? JSON.parse(raw) : [];
  }

  // ------------------------------------------------------------
  // 🔥 INBOX
  // ------------------------------------------------------------
  private static readonly keyInbox = "inbox_items";

  static async saveInboxItem(item: Record<string, any>): Promise<void> {
    const list = await this.getInboxItems();
    list.push(item);
    localStorage.setItem(this.keyInbox, JSON.stringify(list));
  }

  static async getInboxItems(): Promise<Record<string, any>[]> {
    const raw = localStorage.getItem(this.keyInbox);
    return raw ? JSON.parse(raw) : [];
  }

  static async removeInboxItem(item: Record<string, any>): Promise<void> {
    const list = await this.getInboxItems();
    const updated = list.filter(
      (i) =>
        i.timestamp !== item.timestamp ||
        i.type !== item.type ||
        i.qrData !== item.qrData
    );
    localStorage.setItem(this.keyInbox, JSON.stringify(updated));
  }

  // ------------------------------------------------------------
  // 🔥 USER ID
  // ------------------------------------------------------------
  private static cachedUserId: number | null = null;

  static async saveUserId(id: any): Promise<void> {
    const parsed =
      typeof id === "string"
        ? parseInt(id)
        : typeof id === "number"
        ? id
        : Number(id);

    localStorage.setItem("user_id", String(parsed));
    this.cachedUserId = parsed;
  }

  static async getUserId(): Promise<number | null> {
    const raw = localStorage.getItem("user_id");
    return raw ? parseInt(raw) : null;
  }

  static getUserIdSync(): number | null {
    return this.cachedUserId;
  }

  static async init(): Promise<void> {
    const raw = localStorage.getItem("user_id");
    this.cachedUserId = raw ? parseInt(raw) : null;
  }

  // ------------------------------------------------------------
  // 🔥 AUTH TOKEN
  // ------------------------------------------------------------
  static async saveAuthToken(token: string): Promise<void> {
    localStorage.setItem("auth_token", token);
  }

  static async getAuthToken(): Promise<string | null> {
    return localStorage.getItem("auth_token");
  }

  // ------------------------------------------------------------
// 🔥 SYNC METHODS (per AppRouter)
// ------------------------------------------------------------
   static getAuthTokenSync(): string | null {
     return localStorage.getItem("auth_token");
  }

  // ------------------------------------------------------------
  // 🔥 CLEAR ALL
  // ------------------------------------------------------------
  static async clearAll(): Promise<void> {
    localStorage.clear();
    this.cachedUserId = null;
  }
}
