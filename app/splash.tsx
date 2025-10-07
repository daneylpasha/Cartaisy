import { AppImage } from "@/components/atoms/AppImage";
import useAuthStore from "@/store/useAuthStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { YStack } from "tamagui";

const SPLASH_DURATION = 3000;

const Splash = () => {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.push("/onboardingSlides");
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [token]);

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
