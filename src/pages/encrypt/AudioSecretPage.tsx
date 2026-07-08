import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AudioSecretPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode ?? "encrypt";
  const onSelect = location.state?.onSelect ?? (() => {});

  // ⭐ Recorder Web
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [playPosition, setPlayPosition] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [bars, setBars] = useState<number[]>(Array.from({ length: 12 }, () => 5));

  const timerRef = useRef<NodeJS.Timer | null>(null);
  const waveTimerRef = useRef<NodeJS.Timer | null>(null);

  // ⭐ Waveform animation
  const startWaveform = () => {
    waveTimerRef.current = setInterval(() => {
      setBars(Array.from({ length: 12 }, () => Math.random() * 40 + 5));
    }, 120);
  };

  const stopWaveform = () => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
  };

  // ⭐ Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.start();
      setIsRecording(true);
      setRecordedDuration(0);
      setPlayPosition(0);

      timerRef.current = setInterval(() => {
        setRecordedDuration((d) => d + 1);
      }, 1000);

      startWaveform();
    } catch (e) {
      alert("Permesso microfono negato");
    }
  };

  // ⭐ Stop recording
  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    stopWaveform();

    if (timerRef.current) clearInterval(timerRef.current);

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setRecordedBlob(blob);
    };

    setIsRecording(false);
  };

  // ⭐ Playback
  const startPlayback = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.play();
    setIsPlaying(true);

    audio.ontimeupdate = () => {
      setPlayPosition(Math.floor(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlayPosition(0);
    };
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayPosition(0);
  };

  // ⭐ Delete recording
  const deleteRecording = () => {
    stopPlayback();
    setRecordedBlob(null);
    setRecordedDuration(0);
    setPlayPosition(0);
  };

  // ⭐ Confirm
  const confirm = async () => {
    if (!recordedBlob) return;

    const buffer = await recordedBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    onSelect({
      type: "audio",
      payload: bytes,
      mode,
    });

    navigate(-1);
  };

  return (
    <div style={{ padding: 16 }}>
      {/* ⭐ Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          fontSize: 24,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ⬅️
      </button>

      {/* ⭐ Title */}
      <h2 style={{ textAlign: "center" }}>Audio segreto</h2>
      <p style={{ textAlign: "center", fontSize: 16 }}>
        Registra un messaggio vocale da nascondere nel file
      </p>

      {/* ⭐ Record button */}
      <button
        onClick={() => (isRecording ? stopRecording() : startRecording())}
        className="wink-button"
        style={{ marginTop: 30 }}
      >
        {isRecording ? "⏹ Stop" : "🎤 Registra"}
      </button>

      {/* ⭐ Waveform + timer */}
      {isRecording && (
        <>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: h,
                    margin: "0 3px",
                    backgroundColor: "#C99700",
                    borderRadius: 4,
                    boxShadow: "0 0 8px rgba(201,151,0,0.6)",
                    transition: "height 0.12s",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 10, fontSize: 22 }}>
            {Math.floor(recordedDuration / 60)}:
            {(recordedDuration % 60).toString().padStart(2, "0")}
          </div>
        </>
      )}

      {/* ⭐ Playback + delete */}
      {recordedBlob && !isRecording && (
        <>
          <div
            style={{
              marginTop: 30,
              display: "flex",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <button
              onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
              style={{
                background: "none",
                border: "none",
                fontSize: 40,
                cursor: "pointer",
              }}
            >
              {isPlaying ? "⏹" : "▶️"}
            </button>

            <button
              onClick={deleteRecording}
              style={{
                background: "none",
                border: "none",
                color: "red",
                fontSize: 32,
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 10, fontSize: 18 }}>
            {isPlaying
              ? `Riproduzione: ${playPosition}s`
              : `Durata: ${Math.floor(recordedDuration / 60)}:${(
                  recordedDuration % 60
                )
                  .toString()
                  .padStart(2, "0")}`}
          </div>

          {/* ⭐ Confirm */}
          <button
            onClick={confirm}
            className="wink-button"
            style={{ marginTop: 30 }}
          >
            ✔ Conferma
          </button>
        </>
      )}
    </div>
  );
}
