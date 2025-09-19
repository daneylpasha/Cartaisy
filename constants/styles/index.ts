import { Dimensions, Platform } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const SHADOW_STYLES = Platform.select({
  ios: {
    shadowColor: "$shadow",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
  },
  android: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});
