// src/models/P2PSession.ts

// src/models/P2PSession.ts

export type P2PSession = {
  sessionId: string;
  fromUserId: number;
  toUserId: number;

  offer: Record<string, any> | null;
  answer: Record<string, any> | null;

  candidates: any[];

  fileSize: number;
  fileType: string;

  status: string;
  createdAt: string;
};

export function p2pSessionFromJson(json: any): P2PSession {
  return {
    sessionId: json.session_id ?? "",
    fromUserId: json.from_user_id ?? 0,
    toUserId: json.to_user_id ?? 0,

    offer: json.offer ?? null,
    answer: json.answer ?? null,

    candidates: Array.isArray(json.candidates) ? json.candidates : [],

    fileSize: json.fileSize ?? 0,
    fileType: json.fileType ?? "",

    status: json.status ?? "unknown",
    createdAt: json.created_at ?? "",
  };
}
