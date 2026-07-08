// src/widgets/NeonButton.tsx

import React from "react";
import { useColorProvider } from "../providers/ColorProvider";

type NeonButtonProps = {
  label: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
};

export default function NeonButton({ label, onClick, icon: Icon }: NeonButtonProps) {
  const theme = useColorProvider();

  return (
    <div
      style={{
        margin: "8px 0",
        borderRadius: "14px",
        boxShadow: `0 0 8px ${theme.text}40`,
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          backgroundColor: theme.background + "E6",
          color: theme.text,
          padding: "14px 0",
          borderRadius: "14px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          transition: "transform 0.15s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {Icon && <Icon size={22} color={theme.text} />}

        <span
          style={{
            color: theme.text,
            fontSize: "16px",
            fontWeight: 600,
            textShadow: `0 0 4px ${theme.text}66`,
          }}
        >
          {label}
        </span>
      </button>
    </div>
  );
}
