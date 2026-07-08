// src/pages/profile/ProfilePage.tsx

import React, { useEffect, useState } from "react";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { ApiService } from "../services/ApiService";
import { StorageService } from "../services/StorageService";

import "./ProfilePage.css";

export default function ProfilePage() {
    const theme = React.useContext(ColorProviderContext);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // ------------------------------------------------------------
    // LOAD PROFILE + AVATAR
    // ------------------------------------------------------------
    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const profile = await ApiService.getProfile();
        const avatar = profile.avatarUrl || profile.avatar_url || null;

        setImageUrl(avatar);

        await StorageService.saveProfileImageUrl(avatar);
    }

    // ------------------------------------------------------------
    // PICK + UPLOAD AVATAR (WEB)
    // ------------------------------------------------------------
    async function pickAndUpload() {
     const input = document.createElement("input");
     input.type = "file";
     input.accept = "image/*";

     input.onchange = async (e: any) => {
         const file = e.target.files[0];
         if (!file) return;

         setIsUploading(true);

         const uploadedUrl = await ApiService.uploadAvatar(file);

         if (uploadedUrl) {
             await StorageService.saveProfileImageUrl(uploadedUrl);
             setImageUrl(uploadedUrl);
             alert("Immagine aggiornata con successo");
         } else {
           alert("Errore durante il caricamento");
         }

        setIsUploading(false);
      };

      input.click();
    }
    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
    return (
        <WinkWinkScaffold showColorSelector={false}>
            <div className="profile-container">
                <h1 className="profile-title" style={{ color: theme?.primary }}>
                    Profilo
                </h1>

                {/* AVATAR */}
                <div className="profile-avatar-box">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="avatar"
                            className="profile-avatar"
                        />
                    ) : (
                        <div className="profile-avatar placeholder">👤</div>
                    )}
                </div>

                {/* CHANGE IMAGE */}
                <button
                    className="profile-btn"
                    disabled={isUploading}
                    onClick={pickAndUpload}
                    style={{ background: theme?.primary }}
                >
                    {isUploading ? "Caricamento..." : "Cambia immagine"}
                </button>

                {/* ALIAS */}
                <ProfileAlias theme={theme} />

                {/* PHONE */}
                <ProfilePhone theme={theme} />
            </div>
        </WinkWinkScaffold>
    );
}

// ------------------------------------------------------------
// ALIAS COMPONENT
// ------------------------------------------------------------
function ProfileAlias({ theme }: any) {
    const [alias, setAlias] = useState("");

    useEffect(() => {
        (async () => {
            const a = await StorageService.getAlias();
            setAlias(a || "");
        })();
    }, []);

    return (
        <div className="profile-section">
            <div className="profile-label">Alias</div>
            <div className="profile-value" style={{ color: theme.primary }}>
                {alias}
            </div>
        </div>
    );
}

// ------------------------------------------------------------
// PHONE COMPONENT
// ------------------------------------------------------------
function ProfilePhone({ theme }: any) {
    const [phone, setPhone] = useState("");

    useEffect(() => {
        (async () => {
            const profile = await StorageService.getProfile();
            setPhone(profile.phone || "");
        })();
    }, []);

    return (
        <div className="profile-section">
            <div className="profile-label">Telefono</div>
            <div className="profile-value">{phone}</div>
        </div>
    );
}
