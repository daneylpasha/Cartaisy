import React from "react";
import { ActivityIndicator, ColorValue, StyleProp, View, ViewStyle } from "react-native";

type LoaderKitViewProps = {
  style?: StyleProp<ViewStyle>;
  color?: ColorValue;
  name?: string;
};

/**
 * Expo web stand-in for react-native-loader-kit.
 * The native package uses codegenNativeComponent, which pulls React Native
 * UIManager internals Metro cannot resolve on web.
 */
export const LoaderKitView = ({ style, color }: LoaderKitViewProps) => (
  <View style={[{ alignItems: "center", justifyContent: "center" }, style]}>
    <ActivityIndicator color={color} />
  </View>
);

export default LoaderKitView;
