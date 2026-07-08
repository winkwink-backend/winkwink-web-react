// src/models/WWContact.ts

export type WWContact = {
  userId: string;

  alias: string;
  profileImageUrl?: string | null;

  name: string;
  lastName: string;
  phone: string;

  publicKey?: string | null;
  qrData: string;

  peerId?: string | null;
  fingerprint?: string | null;
  version: number;

  isOnline: boolean;
  chatId?: number | null;
};

// ⭐ FROM JSON (equivalente Flutter)
export function wwContactFromJson(json: any): WWContact {
  return {
    userId: (json.id ?? json.userId ?? "").toString(),

    alias: json.alias ?? json.name ?? json.phone ?? "",
    profileImageUrl: json.profileImageUrl ?? json.avatar ?? null,

    name: json.name ?? "",
    lastName: json.last_name ?? json.lastName ?? "",
    phone: json.phone ?? "",

    publicKey: json.public_key ?? json.publicKey ?? null,
    qrData: json.qr_data ?? json.qrData ?? "",

    peerId:
      json.peer_id?.toString() ??
      json.peerId?.toString() ??
      null,

    fingerprint: json.fingerprint ?? null,

    version:
      typeof json.version === "number"
        ? json.version
        : parseInt(json.version?.toString() ?? "1", 10) || 1,

    isOnline: json.is_online ?? json.isOnline ?? false,
    chatId: json.chatId ?? null,
  };
}

// ⭐ TO JSON (equivalente Flutter)
export function wwContactToJson(c: WWContact): any {
  return {
    userId: c.userId,
    alias: c.alias,
    name: c.name,
    lastName: c.lastName,
    phone: c.phone,
    publicKey: c.publicKey,
    qrData: c.qrData,
    peerId: c.peerId,
    fingerprint: c.fingerprint,
    version: c.version,
    chatId: c.chatId,
    isOnline: c.isOnline,
    profileImageUrl: c.profileImageUrl,
  };
}

// ⭐ COPYWITH (equivalente Flutter)
export function wwContactCopyWith(
  c: WWContact,
  updates: Partial<WWContact>
): WWContact {
  return {
    ...c,
    ...updates,
  };
}

// ⭐ EMPTY (equivalente Flutter)
export function wwContactEmpty(): WWContact {
  return {
    userId: "",
    alias: "",
    name: "",
    lastName: "",
    phone: "",
    publicKey: null,
    qrData: "",
    peerId: null,
    fingerprint: null,
    version: 1,
    isOnline: false,
    chatId: null,
    profileImageUrl: null,
  };
}
