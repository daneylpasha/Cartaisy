import { SCREEN_WIDTH } from "@/constants/styles";
import { Spacer } from "@/components/atoms/Spacer";
import { tokens } from "@/tamagui/token";
import React from "react";
import { ScrollView } from "react-native";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import { YStack } from "tamagui";

export const Placeholder = () => {
  return (
    <ShimmerProvider duration={1000}>
      <YStack
        marginLeft={tokens.space.md}
        borderRadius={tokens.radius.lg}
        backgroundColor={"$grey"}
        width={SCREEN_WIDTH - tokens.space.md * 2}
        height={40}
        overflow="hidden"
      >
        <Shimmer easing={Easing.linear} speed={0.5} />
      </YStack>
      <Spacer size={"$md"} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
      >
        {[...Array(2)].map((_, placeholderIndex) => (
          <YStack key={placeholderIndex} width={240}>
            <YStack
              backgroundColor={"$grey"}
              width={240}
              height={240}
              borderRadius={tokens.radius.lg}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width={200}
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width={100}
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width={50}
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
          </YStack>
        ))}
      </ScrollView>
    </ShimmerProvider>
  );
};
