// src/services/WinkCoinService.ts

export class WinkCoinResponse {
  balance?: number;
  lastThanksTime?: Date | null;
  error?: string | null;

  constructor(params: {
    balance?: number;
    lastThanksTime?: Date | null;
    error?: string | null;
  }) {
    this.balance = params.balance;
    this.lastThanksTime = params.lastThanksTime ?? null;
    this.error = params.error ?? null;
  }

  static fromJson(json: any): WinkCoinResponse {
    return new WinkCoinResponse({
      balance: json.balance,
      lastThanksTime: json.lastThanksTime
        ? new Date(json.lastThanksTime)
        : null,
      error: json.error,
    });
  }
}

export class WinkCoinService {
  static readonly baseUrl =
    "https://winkwink-backend1-production.up.railway.app/winkcoin";

  // ------------------------------------------------------------
  // 🔹 GET saldo + lastThanksTime
  // ------------------------------------------------------------
  static async getUserWinkCoins(userId: string): Promise<WinkCoinResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/${userId}`);
      const data = await res.json();
      return WinkCoinResponse.fromJson(data);
    } catch (e) {
      return new WinkCoinResponse({ error: "Errore di comunicazione" });
    }
  }

  // ------------------------------------------------------------
  // 🔹 POST grazie → ritorna nuovo saldo o errore
  // ------------------------------------------------------------
  static async addThanksReward(userId: string): Promise<WinkCoinResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/thanks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      return WinkCoinResponse.fromJson(data);
    } catch (e) {
      return new WinkCoinResponse({ error: "Errore di comunicazione" });
    }
  }

  // ------------------------------------------------------------
  // 🔹 POST send reward
  // ------------------------------------------------------------
  static async addSendReward(userId: string): Promise<WinkCoinResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      return WinkCoinResponse.fromJson(data);
    } catch (e) {
      return new WinkCoinResponse({ error: "Errore di comunicazione" });
    }
  }

  // ------------------------------------------------------------
  // 🔹 POST receive reward
  // ------------------------------------------------------------
  static async addReceiveReward(userId: string): Promise<WinkCoinResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      return WinkCoinResponse.fromJson(data);
    } catch (e) {
      return new WinkCoinResponse({ error: "Errore di comunicazione" });
    }
  }
}
