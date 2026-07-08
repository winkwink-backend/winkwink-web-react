// src/pages/chat/AudioViewerPage.tsx

import React, { useEffect, useRef, useState } from "react";
import "./AudioViewerPage.css";

type Props = {
  url: string;     // URL del file audio (equivalente a path)
  name: string;    // nome del file
};

export default function AudioViewerPage({ url, name }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.oncanplay = () => setReady(true);
    audio.onerror = () => {
      console.error("Errore caricamento audio");
      setReady(false);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url]);

  function play() {
    audioRef.current?.play();
  }

  function pause() {
    audioRef.current?.pause();
  }

  function stop() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  return (
    <div className="avp-container">
      <div className="avp-header">
        <span className="avp-title">{name}</span>
      </div>

      <div className="avp-body">
        {!ready ? (
          <div className="avp-loading">Caricamento…</div>
        ) : (
          <>
            <div className="avp-icon">🎵</div>

            <div className="avp-buttons">
              <NeonButton icon="▶" onClick={play} />
              <NeonButton icon="⏸" onClick={pause} />
              <NeonButton icon="⏹" onClick={stop} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// NEON BUTTON (equivalente Flutter)
// ------------------------------------------------------------
function NeonButton({
  icon,
  onClick,
}: {
  icon: string;
  onClick: () => void;
}) {
  return (
    <div className="avp-neon-btn" onClick={onClick}>
      <span className="avp-neon-icon">{icon}</span>
    </div>
  );
}
