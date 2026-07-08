import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  selectedContacts: Array<{ id: string; name: string }>;
  onContactsSelected: (list: Array<{ id: string; name: string }>) => void;
};

export default function EncryptRecipientSelector({
  selectedContacts,
  onContactsSelected,
}: Props) {
  const navigate = useNavigate();

  const openContactsPage = async () => {
    // ⭐ Nel web non esiste Navigator.pushNamed con ritorno.
    // Quindi usiamo una pagina dedicata che, al termine,
    // richiama onContactsSelected() tramite state globale o callback.

    navigate("/contacts_encrypt", {
      state: {
        onSelect: onContactsSelected,
        selectedContacts,
      },
    });
  };

  return (
    <button
      onClick={openContactsPage}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        backgroundColor: "#C99700",
        borderRadius: "10px",
        border: "none",
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
        marginBottom: "16px",
      }}
    >
      <span style={{ fontSize: 20 }}>👥</span>
      <span>Seleziona destinatari</span>
    </button>
  );
}
