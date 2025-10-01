import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import React from "react";
import { ScrollView } from "react-native";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import { YStack } from "tamagui";
import { Spacer } from "../../atoms/Spacer";

const Placeholder = () => {
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
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        {[...Array(3)].map((_, placeholderIndex) => (
          <YStack key={placeholderIndex}>
            <YStack
              backgroundColor={"$grey"}
              width={163.5}
              height={163.5}
              borderRadius={tokens.radius.lg}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width={163}
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width={163}
              height={20}
              borderRadius={tokens.radius.sm}
              overflow="hidden"
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
            <Spacer size={"$md"} />
            <YStack
              backgroundColor={"$grey"}
              width={163}
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

export default Placeholder;
