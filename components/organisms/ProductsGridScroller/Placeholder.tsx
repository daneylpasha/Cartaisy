import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import React from "react";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import { XStack, YStack } from "tamagui";
import { Spacer } from "../../atoms/Spacer";
import { GRID_CARD_WIDTH, GRID_COLUMN_GAP, GRID_SIDE_PADDING } from "../../molecules/ProductCard";

const Placeholder = () => {
  return (
    <ShimmerProvider duration={1000}>
      <YStack
        marginLeft={GRID_SIDE_PADDING}
        borderRadius={tokens.radius.lg}
        backgroundColor={"$grey"}
        width={SCREEN_WIDTH - GRID_SIDE_PADDING * 2}
        height={40}
        overflow="hidden"
      >
        <Shimmer easing={Easing.linear} speed={0.5} />
      </YStack>
      <Spacer size={"$md"} />
      <XStack flexWrap="wrap" columnGap={GRID_COLUMN_GAP} paddingHorizontal={GRID_SIDE_PADDING}>
        {[...Array(6)].map((_, placeholderIndex) => (
          <YStack key={placeholderIndex} width={GRID_CARD_WIDTH} marginBottom={GRID_COLUMN_GAP}>
            <YStack
              backgroundColor={"$grey"}
              width="100%"
              height={163.5}
              borderRadius={tokens.radius.lg}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width="80%"
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width="60%"
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width="50%"
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
          </YStack>
        ))}
      </XStack>
    </ShimmerProvider>
  );
};

export default Placeholder;
