// src/pages/passepartout/PassepartoutPage.tsx

import React from "react";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";

import "./PassepartoutPage.css";

type Props = {
  title?: string;
  text?: string;
};

export default function PassepartoutPage({
  title = "Passepartout",
  text = "Qui ci sarà il contenuto Passepartout",
}: Props) {
  return (
    <WinkWinkScaffold
      appBarTitle={title}
      showColorSelector={false}
    >
      <div className="pp-container">
        <div className="pp-text">{text}</div>
      </div>
    </WinkWinkScaffold>
  );
}
