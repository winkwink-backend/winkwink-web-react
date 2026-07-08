import { StorageService } from "./services/StorageService";
import { NotificationService } from "./services/NotificationService";
import { SignalingService } from "./services/SignalingService";
import { PendingAdsService } from "./services/PendingAdsService";

// ⭐ Inizializzazione app web
export async function initWinkWinkWebApp() {
  console.log("🚀 WinkWink Web — Init");

  // ------------------------------------------------------------
  // 1️⃣ INIT STORAGE
  // ------------------------------------------------------------
  await StorageService.init();

  // ------------------------------------------------------------
  // 2️⃣ INIT NOTIFICATION SERVICE (stream FCM simulato)
  // ------------------------------------------------------------
  NotificationService.instance;

  // ------------------------------------------------------------
  // 3️⃣ INIT SIGNALING (socket.io)
  // ------------------------------------------------------------
  const userId = await StorageService.getUserId();
  if (userId) {
    console.log("🔌 Connecting signaling with userId:", userId);
    await SignalingService.instance.ensureConnected();
  }

  // ------------------------------------------------------------
  // 4️⃣ INIT FCM WEB (placeholder)
  // ------------------------------------------------------------
  initWebPushFCM();

  // ------------------------------------------------------------
  // 5️⃣ HANDLE PENDING ADS (equivalente lifecycle Flutter)
  // ------------------------------------------------------------
  window.addEventListener("beforeunload", async () => {
    const ads = await PendingAdsService.getPendingAds();
    for (const url of ads) {
      try {
        window.open(url, "_blank");
      } catch (e) {
        console.error("❌ Errore apertura pending ad:", e);
      }
    }
    await PendingAdsService.clearPendingAds();
  });

  console.log("✨ WinkWink Web Ready");
}

// ------------------------------------------------------------
// ⭐ FCM WEB (placeholder)
// ------------------------------------------------------------
function initWebPushFCM() {
  console.log("🔔 FCM Web non implementato (placeholder)");

  // Se vuoi implementare FCM Web:
  // - service worker
  // - firebase-messaging-sw.js
  // - NotificationService.fcmStream.postMessage(data)
}
