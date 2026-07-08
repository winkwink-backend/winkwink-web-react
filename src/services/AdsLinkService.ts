// src/services/AdsLinkService.ts

export class AdsLinkService {
  private static readonly KEY = "current_ad_link";
  private static readonly TIMESTAMP_KEY = "current_ad_timestamp";

  // ⭐ Recupera il link salvato
  static getSavedAdLink(): string | null {
    return localStorage.getItem(this.KEY);
  }

  // ⭐ Salva link + timestamp
  static saveAdLink(url: string): void {
    localStorage.setItem(this.KEY, url);
    localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
  }

  // ⭐ Controlla se il link è vecchio di 15 minuti
  static isExpired(): boolean {
    const ts = localStorage.getItem(this.TIMESTAMP_KEY);
    if (!ts) return true;

    const last = new Date(parseInt(ts, 10));
    const diffMinutes = (Date.now() - last.getTime()) / 1000 / 60;

    return diffMinutes >= 15;
  }

  // ⭐ Recupera link da backend (o Google Ads, ecc.)
  static async fetchNewAdLink(): Promise<string> {
    // OGGI: link fisso
    // DOMANI: chiamata API → Google Ads / Meta Ads / tuo backend
    return "https://winkwink.pro/ads/winkcoin";
  }

  // ⭐ Ottiene il link valido (aggiorna se scaduto)
  static async getValidAdLink(): Promise<string> {
    if (this.isExpired()) {
      const newLink = await this.fetchNewAdLink();
      this.saveAdLink(newLink);
      return newLink;
    }

    return this.getSavedAdLink() ?? (await this.fetchNewAdLink());
  }
}
