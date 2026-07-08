import React, { useEffect, useState } from "react";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { StorageService } from "../services/StorageService";
import { WinkCoinService } from "../services/WinkCoinService";
import { PendingAdsService } from "../services/PendingAdsService";
import { AdsLinkService } from "../services/AdsLinkService";
import { AdsConfig } from "../config/AdsConfig";
import { showInfoDialog } from "../widgets/WWDialogs";
import { useTranslation } from "react-i18next";

export const WinkCoinPage: React.FC = () => {
    const { t } = useTranslation();

    const [balance, setBalance] = useState(0);
    const [lastThanksTime, setLastThanksTime] = useState<Date | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    // ⭐ Carica l'ID utente
    useEffect(() => {
        const init = async () => {
            const id = await StorageService.getUserId();
            setUserId(id);

            if (id !== null) {
                await loadData(id);
            }
        };

        init();
    }, []);

    // ⭐ Legge il saldo dal backend
    const loadData = async (id: number) => {
        const data = await WinkCoinService.getUserWinkCoins(id.toString());

        if (!data.error) {
            setBalance(data.balance ?? 0);
            setLastThanksTime(data.lastThanksTime ?? null);
        }
    };

    // ⭐ Incrementa il saldo
    const giveThanks = async () => {
        if (userId === null) return;

        // 🔀 SWITCH MONETIZZAZIONE
        if (AdsConfig.adsEnabled) {
            await showRewardedAd();
        } else {
            const adLink = await AdsLinkService.getValidAdLink();
            await PendingAdsService.addPendingAd(adLink);
        }

        // ⭐ CHIAMATA BACKEND
        const response = await WinkCoinService.addThanksReward(userId.toString());

        // ⭐ ERRORE DAL BACKEND (Too early)
        if (response.error) {
            showInfoDialog({
                title: t("winkcoinTitle"),
                message: response.error,
            });
            return;
        }

        // ⭐ AGGIORNA STATO
        setBalance(response.balance ?? balance);
        setLastThanksTime(response.lastThanksTime ?? lastThanksTime);
    };

    // 🟢 FUTURO: Rewarded Ads
    const showRewardedAd = async () => {
        // Placeholder identico al tuo Flutter
    };

    return (
        <WinkWinkScaffold userId={userId ?? undefined} showColorSelector={true}>
            <div style={{ padding: "24px 24px 120px" }}>
                <div style={{ marginTop: 20 }} />

                {/* ⭐ SALDO */}
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: "bold",
                        textAlign: "center",
                        marginBottom: 40,
                    }}
                >
                    {t("balance")}: {balance}
                </div>

                {/* ⭐ BOTTONE THANKS */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                        onClick={giveThanks}
                        style={{
                            padding: "10px 20px",
                            fontSize: 16,
                            borderRadius: 8,
                            border: "none",
                            backgroundColor: "#1976d2",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        {t("thanksButton")}
                    </button>

                    <div style={{ width: 8 }} />

                    <span
                        className="material-icons"
                        style={{ fontSize: 26, cursor: "pointer" }}
                        onClick={() =>
                            showInfoDialog({
                                title: t("whatIsThanksTitle"),
                                message: t("whatIsThanksMessage"),
                            })
                        }
                    >
                        help_outline
                    </span>
                </div>
            </div>
        </WinkWinkScaffold>
    );
};
