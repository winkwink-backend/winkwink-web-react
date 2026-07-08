// src/pages/notifications/NotificationCenterPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";
import { NotificationService } from "../services/NotificationService";

import "./NotificationCenterPage.css";

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const theme = React.useContext(ColorProviderContext);

  const [notifications, setNotifications] = useState<any[]>([]);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    (async () => {
      await NotificationService.instance.loadNotifications();
      setNotifications([...NotificationService.instance.all]);
    })();
  }, []);


  // ------------------------------------------------------------
  // OPEN NOTIFICATION
  // ------------------------------------------------------------
  function openNotification(n: any) {
    if (n.type === "alias_request_received") {
      navigate("/alias-request", { state: n });
    }
  }

  // ------------------------------------------------------------
  // RENDER TILE
  // ------------------------------------------------------------
  function renderTile(n: any) {
    const type = n.type;
    const alias = n.alias || "Sconosciuto";
    const date = n.date || "";

    let icon = "🔔";
    let title = "";
    let subtitle = "";

    switch (type) {
      case "alias_request_received":
        icon = "➕";
        title = `Richiesta da ${alias}`;
        subtitle = "Vuole aggiungerti ai contatti";
        break;

      case "alias_request_sent":
        icon = "📤";
        title = `Richiesta inviata a ${alias}`;
        subtitle = "In attesa di risposta";
        break;

      case "alias_request_accepted":
        icon = "✔️";
        title = `${alias} ha accettato`;
        subtitle = "Ora siete in contatto";
        break;

      case "alias_request_rejected":
        icon = "❌";
        title = `${alias} ha rifiutato`;
        subtitle = "Richiesta non accettata";
        break;

      default:
        icon = "🔔";
        title = "Notifica";
        subtitle = "";
    }

    return (
      <div
        key={n.id || Math.random()}
        className="ncp-item"
        onClick={() => openNotification(n)}
      >
        <div className="ncp-icon">{icon}</div>

        <div className="ncp-info">
          <div className="ncp-title" style={{ color: theme?.text }}>
            {title}
          </div>

          <div className="ncp-subtitle" style={{ color: theme?.text + "B3" }}>
            {date ? `${subtitle} • ${date}` : subtitle}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div className="ncp-container">
        <h2 className="ncp-header" style={{ color: theme?.text }}>
          Notifiche
        </h2>

        {notifications.length === 0 ? (
          <div className="ncp-empty" style={{ color: theme?.text + "B3" }}>
            Nessuna notifica
          </div>
        ) : (
          <div className="ncp-list">
            {notifications.map((n) => renderTile(n))}
          </div>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
