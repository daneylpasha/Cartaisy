import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { Text, YStack } from "tamagui";

const CartScreen = () => {
  return (
    <ScreenContainer backgroundColor="background">
      <YStack paddingHorizontal="$md">
        <Spacer size="$2xl" />
        {/* CartScreen content will go here */}
        <YStack>
          <Text>CartScreen</Text>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default CartScreen;
