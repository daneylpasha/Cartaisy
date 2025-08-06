import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const SHADOW_STYLES = {
  shadowColor: "$shadow",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.03,
  shadowRadius: 16,
  elevation: 8, // For Android shadow
};
