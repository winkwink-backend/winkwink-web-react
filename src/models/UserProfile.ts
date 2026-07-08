// src/models/UserProfile.ts

// src/models/UserProfile.ts

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  id: string;
  qrData: string;
  alias: string;
  password?: string | null;
};

// ⭐ Converti in JSON (equivalente Flutter)
export function userProfileToJson(u: UserProfile): any {
  return {
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    email: u.email,
    id: u.id,
    qrData: u.qrData,
    alias: u.alias,
    password: u.password ?? null,
  };
}

// ⭐ Ricostruisci da JSON (equivalente Flutter)
export function userProfileFromJson(json: any): UserProfile {
  return {
    id: json.id?.toString() ?? "",
    firstName: json.name ?? "",
    lastName: json.last_name ?? "",
    phone: json.phone ?? "",
    email: json.email ?? "",
    qrData: json.qr_data ?? "",
    alias: json.alias ?? "",
    password: null, // identico a Flutter: mai inviata dal server
  };
}
