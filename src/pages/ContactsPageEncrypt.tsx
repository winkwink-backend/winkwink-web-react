// src/pages/encrypt/ContactsPageEncrypt.tsx

import React, { useEffect, useState } from "react";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import { ColorProviderContext } from "../providers/ColorProvider";

import { StorageService } from "../services/StorageService";
import { ContactSyncService } from "../services/ContactSyncService";
import { AppState } from "../services/AppState";

import "./ContactsPageEncrypt.css";

export default function ContactsPageEncrypt() {
  const theme = React.useContext(ColorProviderContext);

  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  useEffect(() => {
    loadSavedContactsIfNeeded();
  }, []);

  // ------------------------------------------------------------
  // LOAD SAVED CONTACTS (WW + Alias)
  // ------------------------------------------------------------
  async function loadSavedContactsIfNeeded() {
    // WW contacts
    if (AppState.wwContacts.length === 0) {
      const saved = await StorageService.getWWContacts();
     AppState.wwContacts = saved.map((c) => ({
       ...c,
       userId: String(c.userId),
       peerId: String(c.peerId),
       publicKey: c.publicKey || "",
       version: c.version || 1,
      }));
    }
    // Alias contacts
    if (AppState.aliasContacts.length === 0) {
      const savedAlias = await StorageService.getAliasContacts();
      AppState.aliasContacts = savedAlias;
    }

    await loadContacts();
    setLoading(false);
  }

  // ------------------------------------------------------------
  // REFRESH CONTACTS (sync + save + load)
  // ------------------------------------------------------------
  async function refreshContacts() {
    setLoading(true);

    const sync = await ContactSyncService.syncContacts();

    AppState.wwContacts = sync.wwContacts.map((c) => ({
      ...c,
      userId: String(c.userId),
      peerId: String(c.peerId),
      publicKey: c.publicKey || "",
      version: c.version || 1,
    }));

    AppState.allContacts = sync.allContacts;

    await StorageService.saveWWContacts(AppState.wwContacts);
    await StorageService.saveContacts(AppState.allContacts);

    await loadContacts();
    setLoading(false);
  }

  // ------------------------------------------------------------
  // LOAD CONTACTS (WW + Alias)
  // ------------------------------------------------------------
  async function loadContacts() {
    const ww = AppState.wwContacts;
    const alias = AppState.aliasContacts;

    const wwMapped = ww.map((c) => ({
      alias: c.alias,
      publicKey: c.publicKey || "",
      userId: c.userId,
      peerId: c.peerId,
      version: c.version || 1,
    }));

    const aliasMapped = alias.map((a) => ({
      alias: a.alias,
      publicKey: a.publicKey,
      userId: a.userId,
      peerId: a.peerId,
      version: a.version,
    }));

    setContacts([...wwMapped, ...aliasMapped]);
  }

  // ------------------------------------------------------------
  // DELETE CONTACT (WW only)
  // ------------------------------------------------------------
  async function deleteContact(contact: any) {
    const userId = contact.userId;
    if (!userId) return;

    const parsedId = Number(userId);
    if (!parsedId) return;

    await StorageService.deleteContact(String(parsedId));
    await refreshContacts();

    alert("Contatto eliminato");
  }

  // ------------------------------------------------------------
  // SELECT / UNSELECT CONTACT
  // ------------------------------------------------------------
  function toggleSelect(index: number) {
    const newSet = new Set(selectedIndexes);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndexes(newSet);
  }

  // ------------------------------------------------------------
  // RETURN SELECTED CONTACTS
  // ------------------------------------------------------------
  function confirmSelection() {
    const selectedContacts = [...selectedIndexes].map((i) => {
      const c = contacts[i];
      return {
        alias: String(c.alias),
        publicKey: String(c.publicKey),
        userId: String(c.userId),
        peerId: String(c.peerId),
        version: String(c.version),
      };
    });

    history.back(); // ritorna alla pagina precedente
    window.dispatchEvent(
      new CustomEvent("encryptContactsSelected", {
        detail: selectedContacts,
      })
    );
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold showColorSelector={false}>
      {loading ? (
        <div className="cpe-loading">Caricamento…</div>
      ) : (
        <div className="cpe-container">
          <div className="cpe-refresh">
            <button
              className="cpe-refresh-btn"
              style={{ color: theme?.text }}
              onClick={refreshContacts}
            >
              🔄
            </button>
          </div>

          <h2 className="cpe-title" style={{ color: theme?.text }}>
            Seleziona destinatari
          </h2>

          <div className="cpe-list">
            {contacts.length === 0 ? (
              <div className="cpe-empty" style={{ color: theme?.text }}>
                Nessun contatto disponibile
              </div>
            ) : (
              contacts.map((c, index) => {
                const selected = selectedIndexes.has(index);

                return (
                  <div
                    key={index}
                    className="cpe-item"
                    style={{
                      background: theme?.background + "40",
                      borderColor: selected
                        ? theme?.primary
                        : theme?.text + "50",
                      borderWidth: selected ? 2 : 1,
                    }}
                    onClick={() => toggleSelect(index)}
                  >
                    <div className="cpe-alias" style={{ color: theme?.text }}>
                      {c.alias}
                    </div>

                    <div
                      className="cpe-subtitle"
                      style={{ color: theme?.text + "90" }}
                    >
                      Chiave ECC presente
                    </div>

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelect(index)}
                      className="cpe-checkbox"
                    />
                  </div>
                );
              })
            )}
          </div>

          <button
            className="cpe-confirm-btn"
            style={{ background: theme?.primary }}
            onClick={confirmSelection}
          >
            Invia
          </button>
        </div>
      )}
    </WinkWinkScaffold>
  );
}
