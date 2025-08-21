import { StyleSheet } from "react-native";
import { tokens } from "../../../tamagui/token";

const bottomSheetStyles = StyleSheet.create({
  handleIndicator: {
    opacity: 0.4,
    width: 48,
    height: 4,
    backgroundColor: "#CBD5E1",
  },
  baseBottomSheet: {
    backgroundColor: "transparent",
  },
  backgroundStyle: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: tokens.color.white,
    overflow: "hidden",
  },
});

export { bottomSheetStyles };
