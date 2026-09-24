import ImageViewing from "react-native-image-viewing";
import React from "react";

type ViewerImage = { uri: string };

type FullscreenImageViewerProps = {
  images: ViewerImage[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  doubleTapToZoomEnabled?: boolean;
};

/**
 * Native full-screen gallery. Web uses FullscreenImageViewer.web.tsx so Metro
 * does not pull in react-native-image-viewing, which only ships iOS/Android
 * ImageItem implementations.
 */
export default function FullscreenImageViewer(
  props: FullscreenImageViewerProps
) {
  return <ImageViewing {...props} />;
}
