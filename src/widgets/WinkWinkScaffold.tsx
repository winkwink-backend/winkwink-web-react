import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useColorProvider } from "../providers/ColorProvider";
import { AppRoutes } from "../routes/AppRoutes";
import { StorageService } from "../services/StorageService";
import { NotificationService } from "../services/NotificationService";

import "./WinkWinkScaffold.css";

type Props = {
  children: React.ReactNode;
  showColorSelector?: boolean;
  userId?: number;
  header?: React.ReactNode;
  floatingButton?: React.ReactNode;
  appBar?: React.ReactNode; 
  appBarTitle?: string;
  dark?: boolean;
};

export default function WinkWinkScaffold({
  children,
  showColorSelector = false,
  userId,
  header,
  floatingButton,
  appBar,
  appBarTitle,
  dark,
}: Props) {
  const navigate = useNavigate();
  const theme = useColorProvider();

  const [showPalette, setShowPalette] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const effectiveUserId = userId ?? StorageService.getUserIdSync();

  // FOTO PROFILO
  useEffect(() => {
    StorageService.getProfileImageUrl().then(setProfileImage);
  }, []);

  // NOTIFICHE
  useEffect(() => {
    const channel = NotificationService.instance;
    const update = () => setUnread(channel.unreadCount);
    channel.subscribe(update);
    update();
    return () => channel.unsubscribe(update);
  }, []);

  // PALETTE COLORI
  const colorOptions = [
    { background: "#000000", text: "#FFFFFF", primary: "#000000" },
    { background: "#786D46", text: "#0D0D0D", primary: "#786D46" },
    { background: "#FFAB94", text: "#000000", primary: "#FFAB94" },
    { background: "#FFDCD3", text: "#1C1B1B", primary: "#FFDCD3" },
  ];

  return (
    <div className="wink-scaffold">
      {/* SFONDO */}
      <img src="/assets/wink-bg.png" className="wink-bg" />

      <div className="wink-content">
        {/* HEADER CUSTOM */}
        {header}

        {/* HEADER STANDARD */}
        {!header && (
          <div className="wink-header">
            {/* RIGA 1 */}
            <div className="wink-header-row1">
              <img
                src="/assets/icon/marchiologo_winkwink1.png"
                className="wink-logo"
              />

              <div className="wink-title">WinkWink</div>

              <div
                className="wink-avatar"
                onClick={() => navigate(AppRoutes.profile)}
              >
                {profileImage ? (
                  <img src={profileImage} className="wink-avatar-img" />
                ) : (
                  <div className="wink-avatar-placeholder">👤</div>
                )}
              </div>
            </div>

            {/* RIGA 2 — ICONE */}
            <div className="wink-header-icons">
              <button
                className="wink-icon-btn"
                onClick={() =>
                  navigate(AppRoutes.chatList + `?userId=${effectiveUserId}`)
                }
              >
                💬
              </button>

              <div className="wink-icon-notification">
                <button
                  className="wink-icon-btn"
                  onClick={() => navigate(AppRoutes.inbox)}
                >
                  🔔
                </button>
                {unread > 0 && (
                  <span className="wink-badge">{unread}</span>
                )}
              </div>

              <button
                className="wink-icon-btn"
                onClick={() => navigate(AppRoutes.downloadCenter)}
              >
                ⬇️
              </button>

              <button
                className="wink-icon-btn"
                onClick={() => navigate(AppRoutes.contacts)}
              >
                👥
              </button>

              <button
                className="wink-icon-btn"
                onClick={() => navigate(AppRoutes.recoverAccount)}
              >
                ⚙️
              </button>
            </div>
          </div>
        )}

        {/* CONTENUTO PAGINA */}
        <div className="wink-body" style={{ color: theme.text }}>
          {children}
        </div>

        {/* FLOATING BUTTON */}
        {floatingButton && (
          <div className="wink-floating">{floatingButton}</div>
        )}

        {/* PALETTE COLORI */}
        {showColorSelector && (
          <div className="wink-palette-container">
            {showPalette && (
              <div className="wink-palette-box">
                {colorOptions.map((opt, i) => (
                  <div
                    key={i}
                    className="wink-palette-color"
                    style={{
                      backgroundColor: opt.background,
                      borderColor: opt.text,
                    }}
                    onClick={() => {
                      theme.setTheme(opt.background, opt.text, opt.primary);
                      setShowPalette(false);
                    }}
                  />
                ))}
              </div>
            )}

            <div
              className="wink-palette-toggle"
              onClick={() => setShowPalette(!showPalette)}
            >
              <img
                src="/assets/icon/winkwink_icon1.png"
                className="wink-palette-icon"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
