import React, { useEffect, useState, useContext } from "react";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";
import { StorageService } from "../services/StorageService";
import { useTranslation } from "react-i18next";

export const SettingsPage: React.FC = () => {
  const theme = useContext(ColorProviderContext);
  const { t } = useTranslation();

  const [sendOnlyWifi, setSendOnlyWifi] = useState(false);
  const [receiveOnlyWifi, setReceiveOnlyWifi] = useState(false);
  const [notifyWingSound, setNotifyWingSound] = useState(false);
  const [notifySendComplete, setNotifySendComplete] = useState(false);
  const [notifyReceiveComplete, setNotifyReceiveComplete] = useState(false);

  // ------------------------------------------------------------
  // 🔥 CARICA LE IMPOSTAZIONI SALVATE
  // ------------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      setSendOnlyWifi(await StorageService.getBool("sendOnlyWifi") ?? false);
      setReceiveOnlyWifi(await StorageService.getBool("receiveOnlyWifi") ?? false);
      setNotifyWingSound(await StorageService.getBool("notifyWingSound") ?? false);
      setNotifySendComplete(await StorageService.getBool("notifySendComplete") ?? false);
      setNotifyReceiveComplete(await StorageService.getBool("notifyReceiveComplete") ?? false);
    };

    load();
  }, []);

  // ------------------------------------------------------------
  // 🔥 SALVA UNA SINGOLA IMPOSTAZIONE
  // ------------------------------------------------------------
  const saveSetting = async (key: string, value: boolean) => {
    await StorageService.setBool(key, value);
  };

  return (
    <WinkWinkScaffold
      appBar={
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 16,
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Impostazioni
        </div>
      }
    >
      <div style={{ padding: 20 }}>
        {/* ⭐ 1 — INVIA SOLO IN WIFI */}
        <ToggleItem
          title="Invia file solo tramite Wi‑Fi"
          subtitle="Evita l'uso dei dati mobili durante l'invio"
          value={sendOnlyWifi}
          onChange={(v) => {
            setSendOnlyWifi(v);
            saveSetting("sendOnlyWifi", v);
          }}
        />

        {/* ⭐ 2 — RICEVI SOLO IN WIFI */}
        <ToggleItem
          title="Ricevi file solo tramite Wi‑Fi"
          subtitle="Evita l'uso dei dati mobili durante la ricezione"
          value={receiveOnlyWifi}
          onChange={(v) => {
            setReceiveOnlyWifi(v);
            saveSetting("receiveOnlyWifi", v);
          }}
        />

        <Divider />

        {/* ⭐ 3 — SUONO WING */}
        <ToggleItem
          title="Suono Wing per nuovi messaggi"
          subtitle="Riproduce un suono quando arriva un nuovo messaggio"
          value={notifyWingSound}
          onChange={(v) => {
            setNotifyWingSound(v);
            saveSetting("notifyWingSound", v);
          }}
        />

        {/* ⭐ 4 — SUONO WINKWINK (invio completato) */}
        <ToggleItem
          title="Suono WinkWink a invio completato"
          subtitle="Riproduce un suono quando un file è stato inviato"
          value={notifySendComplete}
          onChange={(v) => {
            setNotifySendComplete(v);
            saveSetting("notifySendComplete", v);
          }}
        />

        {/* ⭐ 5 — SUONO WINKWINK (ricezione completata) */}
        <ToggleItem
          title="Suono WinkWink a ricezione completata"
          subtitle="Riproduce un suono quando un file è stato ricevuto"
          value={notifyReceiveComplete}
          onChange={(v) => {
            setNotifyReceiveComplete(v);
            saveSetting("notifyReceiveComplete", v);
          }}
        />

        <div style={{ height: 40 }} />
      </div>
    </WinkWinkScaffold>
  );
};

// ------------------------------------------------------------
// 🔧 COMPONENTI UI MINIMALI
// ------------------------------------------------------------

const ToggleItem: React.FC<{
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ title, subtitle, value, onChange }) => (
  <div
    style={{
      marginBottom: 30,
      color: "white",
    }}
  >
    <div style={{ fontSize: 16, fontWeight: "bold" }}>{title}</div>
    <div style={{ fontSize: 14, color: "white70", marginBottom: 10 }}>
      {subtitle}
    </div>

    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ transform: "scale(1.4)" }}
      />
      <span style={{ color: "white" }}>{value ? "Attivo" : "Disattivo"}</span>
    </label>
  </div>
);

const Divider = () => (
  <div
    style={{
      height: 1,
      backgroundColor: "rgba(255,255,255,0.3)",
      margin: "40px 0",
    }}
  />
);
