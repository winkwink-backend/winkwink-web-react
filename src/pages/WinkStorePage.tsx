import React from "react";

export const WinkStorePage: React.FC = () => {
  const openStore = () => {
    window.open("https://store.winkwink.pro", "_blank");
  };

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      {/* 🔥 AppBar */}
      <div
        style={{
          backgroundColor: "black",
          padding: 16,
          color: "white",
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
        WinkStore
      </div>

      {/* 🔥 Body */}
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ height: 40 }} />

        <span
          className="material-icons"
          style={{ color: "pink", fontSize: 80 }}
        >
          storefront
        </span>

        <div style={{ height: 30 }} />

        <div
          style={{
            color: "white",
            fontSize: 26,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Benvenuto nel WinkStore!
        </div>

        <div style={{ height: 16 }} />

        <div
          style={{
            color: "white70",
            fontSize: 16,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Qui puoi acquistare prodotti WinkWink, gadget,
          <br />
          accessori e contenuti esclusivi.
        </div>

        <div style={{ height: 40 }} />

        <button
          onClick={openStore}
          style={{
            backgroundColor: "pink",
            color: "white",
            padding: "16px 32px",
            borderRadius: 12,
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          Apri WinkStore
        </button>

        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
};
