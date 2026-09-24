import React from "react";
import { Image, Modal, Pressable, StyleSheet } from "react-native";

type ViewerImage = { uri: string };

type FullscreenImageViewerProps = {
  images: ViewerImage[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  doubleTapToZoomEnabled?: boolean;
};

/**
 * Web stand-in for react-native-image-viewing. That package's ImageItem
 * module is ios/android only, so importing it breaks the Expo web bundle.
 * Tap anywhere to close. Pinch-zoom stays on native.
 */
export default function FullscreenImageViewer({
  images,
  imageIndex,
  visible,
  onRequestClose,
}: FullscreenImageViewerProps) {
  const uri = images[imageIndex]?.uri;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : null}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "80%",
  },
});
