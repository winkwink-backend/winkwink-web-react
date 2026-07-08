// src/pages/chat/SelectContactForChatPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";
import { StorageService } from "../services/StorageService";
import { AppState } from "../services/AppState";


import "./SelectContactForChatPage.css";

export default function SelectContactForChatPage() {
  const navigate = useNavigate();
  const theme = React.useContext(ColorProviderContext);

  const [wwContacts, setWwContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // LOAD CONTACTS
  // ------------------------------------------------------------
  useEffect(() => {
    (async () => {
      const saved = await StorageService.getWWContacts();
      setWwContacts(saved);
      setLoading(false);
    })();
  }, []);

  // ------------------------------------------------------------
  // SELECT CONTACT → return to caller
  // ------------------------------------------------------------
  function selectContact(contact: any) {
    AppState.selectedContact = contact;
    navigate(-1);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      {loading ? (
        <div className="scfc-loading">Caricamento…</div>
      ) : (
        <div className="scfc-container">
          <h2 className="scfc-title">Seleziona un contatto</h2>

          <div className="scfc-list">
            {wwContacts.map((c, i) => (
              <div
                key={i}
                className="scfc-item"
                style={{
                  background: theme?.background + "40",
                  borderColor: theme?.text + "50",
                }}
                onClick={() => selectContact(c)}
              >
                <div className="scfc-name" style={{ color: theme?.text }}>
                  {c.name}
                </div>

                <div
                  className="scfc-phone"
                  style={{ color: theme?.text + "90" }}
                >
                  {c.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WinkWinkScaffold>
  );
}
