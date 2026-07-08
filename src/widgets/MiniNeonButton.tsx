// src/widgets/MiniNeonButton.tsx

import React from "react";
import { useColorProvider } from "../providers/ColorProvider";
import type { IconType } from "react-icons";


type MiniNeonButtonProps = {
  icon: IconType;
  label: string;
  onClick: () => void;
};

export default function MiniNeonButton({
  icon: Icon,
  label,
  onClick,
}: MiniNeonButtonProps) {
  const theme = useColorProvider();

  return (
    <div
      style={{
        margin: "8px 0",
        height: "54px",
        borderRadius: "14px",
        backgroundColor: theme.background + "E6", // 0.9 opacity
        border: `1.2px solid ${theme.text}59`, // 0.35 opacity
        boxShadow: `0 0 8px ${theme.text}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
      onClick={onClick}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          maxWidth: "90%",
        }}
      >
        <Icon size={22} color={theme.text} />

        <span
          style={{
            color: theme.text,
            fontSize: "16px",
            fontWeight: 600,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow: `0 0 4px ${theme.text}66`,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
