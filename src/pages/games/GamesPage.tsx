// src/pages/games/GamesPage.tsx

import React from "react";
import WinkWinkScaffold from "../../widgets/WinkWinkScaffold";

import "./GamesPage.css";

export default function GamesPage() {
  return (
    <WinkWinkScaffold
      appBarTitle="Games"
      showColorSelector={false}
    >
      <div className="games-container">
        <div className="games-text">
          Qui ci sarà il gioco WinkWink
        </div>
      </div>
    </WinkWinkScaffold>
  );
}
