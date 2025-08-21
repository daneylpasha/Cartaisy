import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { YStack } from "tamagui";

const PdpScreen = () => {
  return (
    <ScreenContainer>
      <YStack>
        <Spacer size={"$md"} />
      </YStack>
    </ScreenContainer>
  );
};

export default PdpScreen;
