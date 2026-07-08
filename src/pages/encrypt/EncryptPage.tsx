import { useState } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../../widgets/WinkWinkScaffold";

import EncryptHeader from "./EncryptHeader";
import EncryptRecipientSelector from "./EncryptRecipientSelector";
import EncryptVisibleImage from "./EncryptVisibleImage";
import EncryptSecretSelector from "./EncryptSecretSelector";
import { EncryptLogic } from "../../services/EncryptLogic";
import type { SecretData } from "../../types/SecretData";


export default function EncryptPage() {
  const navigate = useNavigate();

  // ⭐ Stati equivalenti a Flutter
  const [selectedContacts, setSelectedContacts] = useState<Array<any>>([]);
  const [visibleImage, setVisibleImage] = useState<File | null>(null);
  const [selectedSecret, setSelectedSecret] = useState<SecretData | null>(null);

  const [showSecretReadyBanner, setShowSecretReadyBanner] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [fileName, setFileName] = useState("");

  return (
    <WinkWinkScaffold showColorSelector={false}>
      <div
        style={{
          padding: 16,
          overflowY: "auto",
          maxHeight: "calc(100vh - 80px)",
        }}
      >
        {/* ⭐ HEADER */}
        <EncryptHeader
          fileName={fileName}
          onFileNameChange={setFileName}
          showSecretReadyBanner={showSecretReadyBanner}
        />

        {/* ⭐ SELEZIONE DESTINATARI */}
        <EncryptRecipientSelector
          selectedContacts={selectedContacts}
          onContactsSelected={setSelectedContacts}
        />

        {/* ⭐ SELEZIONE IMMAGINE VISIBILE */}
        {selectedContacts.length > 0 && (
          <EncryptVisibleImage
            visibleImage={visibleImage}
            onImageSelected={setVisibleImage}
          />
        )}

        {/* ⭐ SELEZIONE FILE SEGRETO */}
        {visibleImage && (
          <EncryptSecretSelector
            selectedSecret={selectedSecret}
            onSecretSelected={(secret: SecretData) => {
             setSelectedSecret(secret);
             setShowSecretReadyBanner(true);

             setTimeout(() => {
               setShowSecretReadyBanner(false);
             }, 2000);
           }}
           onSecretCleared={() => setSelectedSecret(null)}
         />
        )}

        {/* ⭐ BOTTONE INVIO */}
        {selectedSecret && (
          <button
            className="wink-button"
            onClick={async () => {
              setIsProcessing(true);
              setUploadProgress(0);

              await EncryptLogic.encryptAndShare({
                fileName,
                visibleImage,
                selectedSecret,
                selectedContacts,
                onProgress: setUploadProgress,
              });

              setIsProcessing(false);
              navigate(-1); // equivalente a Navigator.pop(context)
            }}
          >
            Invia file
          </button>
        )}
      </div>

      {/* ⭐ OVERLAY: cifratura + upload */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 220,
              textAlign: "center",
              color: "white",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 20 }}>
              Invio in corso…
            </div>

            <progress
              value={uploadProgress}
              max={1}
              style={{ width: "100%", height: 6 }}
            />

            <div style={{ marginTop: 10 }}>
              {Math.round(uploadProgress * 100)}%
            </div>
          </div>
        </div>
      )}
    </WinkWinkScaffold>
  );
}
