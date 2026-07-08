import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const VideoViewerPage: React.FC = () => {
  const location = useLocation();
  const { path, name } = location.state as { path: string; name: string };

  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => setReady(true);
    video.addEventListener("loadeddata", onLoaded);

    return () => {
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(
      0,
      Math.min(video.currentTime + seconds, video.duration)
    );
    video.currentTime = newTime;
  };

  const NeonButton: React.FC<{ icon: string; onClick: () => void }> = ({
    icon,
    onClick,
  }) => (
    <div
      onClick={onClick}
      style={{
        padding: 14,
        borderRadius: "50%",
        border: "3px solid #C99700",
        boxShadow: "0 0 12px #C99700",
        cursor: "pointer",
      }}
    >
      <span
        className="material-icons"
        style={{ color: "white", fontSize: 28 }}
      >
        {icon}
      </span>
    </div>
  );

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      {/* AppBar */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 16,
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {name}
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 60px)",
          position: "relative",
        }}
      >
        {!ready ? (
          <div className="loader-gold" />
        ) : (
          <div style={{ width: "100%", textAlign: "center" }}>
            <video
              ref={videoRef}
              src={`/api/video?path=${encodeURIComponent(path)}`}
              style={{ maxWidth: "100%" }}
              onClick={togglePlay}
            />

            {/* Controlli neon */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                padding: "16px 20px",
                backgroundColor: "rgba(0,0,0,0.3)",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <NeonButton icon="replay_10" onClick={() => seekRelative(-10)} />
              <NeonButton
                icon={isPlaying ? "pause" : "play_arrow"}
                onClick={togglePlay}
              />
              <NeonButton icon="forward_10" onClick={() => seekRelative(10)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
