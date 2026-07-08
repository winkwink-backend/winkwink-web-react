// src/pages/viewers/ImageViewerPage.tsx

import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import WinkWinkScaffold from "../widgets/WinkWinkScaffold";

import "./ImageViewerPage.css";

type Props = {
  url?: string;          // URL dell'immagine
  bytes?: Uint8Array;    // bytes dell'immagine (decrypt)
  name: string;
};

export default function ImageViewerPage({ url, bytes, name }: Props) {
  // Se arrivano bytes, creiamo un blob URL
 const blobUrl = bytes
  ? URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "image/png" }))
  : url;

  return (
    <WinkWinkScaffold
      appBarTitle={name}
      showColorSelector={false}
      dark
    >
      <div className="ivp-container">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
        >
          <TransformComponent>
            <img
              src={blobUrl!}
              alt={name}
              className="ivp-image"
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </WinkWinkScaffold>
  );
}
