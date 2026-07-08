import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type FileItem = {
  path: string;
  name: string;
};

interface SandwichViewerPageProps {
  path: string;
  name: string;
}

export const SandwichViewerPage: React.FC<SandwichViewerPageProps> = ({
  path,
  name,
}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    // 🔥 Qui chiamerai la tua API backend
    // Esempio: GET /api/files?folder=/path/to/folder

    const folder = path.substring(0, path.lastIndexOf("/"));

    const response = await fetch(`/api/files?folder=${encodeURIComponent(folder)}`);
    const list: FileItem[] = await response.json();

    const filtered = list.filter((f) => f.name !== "meta.json");

    setFiles(filtered);
  };

  const detectType = (filePath: string) => {
    const ext = filePath.toLowerCase();

    if (ext.endsWith(".jpg") || ext.endsWith(".png")) return "image";
    if (ext.endsWith(".txt")) return "text";
    if (ext.endsWith(".mp3") || ext.endsWith(".aac")) return "audio";
    if (ext.endsWith(".mp4") || ext.endsWith(".mov")) return "video";

    return "unknown";
  };

  const openFile = (filePath: string, type: string) => {
    navigate("/viewer", {
      state: {
        path: filePath,
        type,
        name: filePath.split("/").pop(),
      },
    });
  };

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      {/* 🔥 AppBar */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: "16px",
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {name}
      </div>

      {/* 🔥 Body */}
      {files.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            marginTop: 80,
            color: "white70",
            fontSize: 18,
          }}
        >
          Nessun contenuto
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          {files.map((f, i) => {
            const type = detectType(f.path);

            return (
              <div
                key={i}
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onClick={() => openFile(f.path, type)}
              >
                <div style={{ color: "#C99700", fontSize: 18, marginBottom: 4 }}>
                  {f.name}
                </div>
                <div style={{ color: "white70", fontSize: 14 }}>{type}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
