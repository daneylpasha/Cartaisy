import { AppImage } from "@/components/atoms/AppImage";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { YStack } from "tamagui";

const Splash = () => {
  useEffect(() => {
    setTimeout(() => {
      // router.push("/onboardingSlides");
      router.replace("/(tabs)");
    }, 3000);
  }, []);

  return (
    <YStack
      flex={1}
      backgroundColor="$primary"
      justifyContent="center"
      alignItems="center"
    >
      <AppImage width={70} height={79} name={"bagWhite"} />
    </YStack>
  );
};

export default Splash;
