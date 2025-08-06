import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { Text, YStack } from "tamagui";

const WishlistScreen = () => {
  return (
    <ScreenContainer backgroundColor="background">
      <YStack paddingHorizontal="$md">
        <Spacer size="$2xl" />
        {/* HomeScreen content will go here */}
        <YStack>
          <Text>WishlistScreen</Text>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default WishlistScreen;
