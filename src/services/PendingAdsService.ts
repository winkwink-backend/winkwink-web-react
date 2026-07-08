// src/services/PendingAdsService.ts

export class PendingAdsService {
  private static readonly key = "pending_ads";

  // ============================================================
  // ⭐ Recupera lista pending ads
  // ============================================================
  static async getPendingAds(): Promise<string[]> {
    const raw = localStorage.getItem(PendingAdsService.key);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // ============================================================
  // ⭐ Aggiunge un pending ad
  // ============================================================
  static async addPendingAd(url: string): Promise<void> {
    const list = await PendingAdsService.getPendingAds();
    list.push(url);
    localStorage.setItem(PendingAdsService.key, JSON.stringify(list));
  }

  // ============================================================
  // ⭐ Cancella tutti i pending ads
  // ============================================================
  static async clearPendingAds(): Promise<void> {
    localStorage.removeItem(PendingAdsService.key);
  }
}
