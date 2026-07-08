import React from "react";
import ImageViewerPage from "./ImageViewerPage";
import { TextViewerPage } from "./TextViewerPage";
import AudioViewerPage from "./AudioViewerPage";
import { VideoViewerPage } from "./VideoViewerPage";
import { SandwichViewerPage } from "./SandwichViewerPage";

interface ViewerPageProps {
  item: {
    type: string;
    path: string;
    name: string;
  };
}

export const ViewerPage: React.FC<ViewerPageProps> = ({ item }) => {
  const { type, path, name } = item;

  switch (type) {
    case "image":
      return <ImageViewerPage url={path} name={name} />;

    case "text":
       return <TextViewerPage />;

    case "audio":
      return <AudioViewerPage url={path} name={name} />;


    case "video":
       return <VideoViewerPage />;

    case "sandwich":
      return <SandwichViewerPage path={path} name={name} />;

    default:
      return (
        <div
          style={{
            backgroundColor: "black",
            color: "white",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
          }}
        >
          Tipo non supportato
        </div>
      );
  }
};
