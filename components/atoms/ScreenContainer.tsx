import { tokens } from "@/tamagui/token";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { YStackProps } from "tamagui";

type ColorToken = keyof typeof tokens.color;
type ColorTokenWithPrefix = ColorToken | `$${ColorToken}`;

type ScreenContainerProps = {
  children: YStackProps["children"];
  backgroundColor?: ColorTokenWithPrefix;
  topNotchColor?: ColorTokenWithPrefix;
  bottomNotchColor?: ColorTokenWithPrefix;
};

const ScreenContainer = ({
  children,
  backgroundColor,
  topNotchColor,
  bottomNotchColor,
}: ScreenContainerProps) => {
  const getTokenValue = (token: ColorTokenWithPrefix | undefined) => {
    if (!token) return undefined;
    // Remove $ if present
    const cleanToken = token.startsWith("$") ? token.slice(1) : token;
    return tokens.color[cleanToken as keyof typeof tokens.color];
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top notch */}
      <SafeAreaView
        edges={["top"]}
        style={{
          backgroundColor: getTokenValue(topNotchColor || backgroundColor),
        }}
      />

      {/* Main content area */}
      <SafeAreaView
        edges={["left", "right"]}
        style={{
          flex: 1,
          backgroundColor: getTokenValue(backgroundColor),
        }}
      >
        {children}
      </SafeAreaView>

      {/* Bottom notch */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: getTokenValue(bottomNotchColor || backgroundColor),
        }}
      />
    </View>
  );
};

export { ScreenContainer };
