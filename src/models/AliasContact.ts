// src/models/AliasContact.ts

export type AliasContact = {
  alias: string;
  profileImageUrl: string;
  userId: string;
  peerId: string;
  publicKey: string;
  version: number;
};

// FROM JSON → AliasContact
export function aliasContactFromJson(json: any): AliasContact {
  return {
    alias: json.alias ?? "",
    profileImageUrl: json.profileImageUrl ?? json.profileImage ?? "",
    userId: json.userId?.toString() ?? "",
    peerId: json.peerId?.toString() ?? "",
    publicKey: json.publicKey ?? "",
    version: json.version ?? 1,
  };
}

// TO JSON → Map<String, dynamic>
export function aliasContactToJson(c: AliasContact): any {
  return {
    alias: c.alias,
    profileImageUrl: c.profileImageUrl,
    userId: c.userId,
    peerId: c.peerId,
    publicKey: c.publicKey,
    version: c.version,
  };
}

// COPYWITH (equivalente Flutter)
export function aliasContactCopyWith(
  c: AliasContact,
  updates: Partial<AliasContact>
): AliasContact {
  return {
    alias: updates.alias ?? c.alias,
    profileImageUrl: updates.profileImageUrl ?? c.profileImageUrl,
    userId: updates.userId ?? c.userId,
    peerId: updates.peerId ?? c.peerId,
    publicKey: updates.publicKey ?? c.publicKey,
    version: updates.version ?? c.version,
  };
}

// LIST FROM JSON STRING
export function aliasContactListFromJson(jsonString: string): AliasContact[] {
  const data = JSON.parse(jsonString);
  return data.map((e: any) => aliasContactFromJson(e));
}

// LIST TO JSON STRING
export function aliasContactListToJson(list: AliasContact[]): string {
  return JSON.stringify(list.map(aliasContactToJson));
}
