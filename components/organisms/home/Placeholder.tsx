import { SCREEN_WIDTH } from "@/constants/styles";
import React from "react";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import { XStack, YStack } from "tamagui";
import { Spacer } from "../../atoms/Spacer";
const PADDING = 16;
const GAP = 12;
const COLUMNS = 4;

const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
const PlaceHolder = () => {
  return (
    <ShimmerProvider duration={1000}>
      <YStack marginTop={"$xl"} paddingHorizontal={"$md"}>
        <YStack
          backgroundColor={"$grey"}
          height={200}
          borderRadius={"$lg"}
          overflow="hidden"
        >
          <Shimmer easing={Easing.linear} speed={0.5} />
        </YStack>
        <Spacer size={"$md"} />
        <YStack
          backgroundColor={"$grey"}
          width={70}
          height={20}
          borderRadius={"$sm"}
          overflow="hidden"
        >
          <Shimmer easing={Easing.linear} speed={0.5} />
        </YStack>
        <Spacer size={"$reg"} />
        <YStack
          backgroundColor={"$grey"}
          width={150}
          height={20}
          borderRadius={"$sm"}
          overflow="hidden"
        >
          <Shimmer easing={Easing.linear} speed={0.5} />
        </YStack>

        <Spacer size={"$reg"} />
        <YStack
          backgroundColor={"$grey"}
          width={250}
          height={20}
          borderRadius={"$sm"}
          overflow="hidden"
        >
          <Shimmer easing={Easing.linear} speed={0.5} />
        </YStack>

        <Spacer size={"$reg"} />
        <YStack
          backgroundColor={"$grey"}
          width={150}
          height={50}
          borderRadius={"$full"}
          overflow="hidden"
        >
          <Shimmer easing={Easing.linear} speed={0.5} />
        </YStack>

        <Spacer size={"$md"} />
        <XStack
          flexWrap="wrap"
          justifyContent="space-between"
          marginTop={"$md"}
        >
          {[...Array(8)].map((_, index) => (
            <YStack key={index} width={ITEM_WIDTH} marginBottom={"$reg"}>
              <YStack alignItems="center">
                <YStack
                  backgroundColor={"$grey"}
                  width={"$3xl"}
                  height={"$3xl"}
                  borderRadius={"$full"}
                  overflow="hidden"
                >
                  <Shimmer easing={Easing.linear} speed={0.5} />
                </YStack>
              </YStack>
              <Spacer size={"$sm"} />
              <YStack
                backgroundColor={"$grey"}
                width={50}
                alignSelf="center"
                height={10}
                borderRadius={"$sm"}
                overflow="hidden"
              >
                <Shimmer easing={Easing.linear} speed={0.5} />
              </YStack>
              <Spacer size={"$sm"} />
              <YStack
                backgroundColor={"$grey"}
                width={30}
                height={10}
                borderRadius={"$sm"}
                alignSelf="center"
                overflow="hidden"
              >
                <Shimmer easing={Easing.linear} speed={0.5} />
              </YStack>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </ShimmerProvider>
  );
};

export default PlaceHolder;
