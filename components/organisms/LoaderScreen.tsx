import { AppImage } from "@/components/atoms/AppImage";
import { tokens } from "@/tamagui/token";
import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { Spacer, YStack } from "tamagui";
import { ScreenContainer } from "../atoms/ScreenContainer";

interface LoaderScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const LoaderScreen = ({
  onComplete,
  duration = 3000,
}: LoaderScreenProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(1)).current;
  const dot4Anim = useRef(new Animated.Value(0.3)).current;
  const dot5Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Progress bar animation
    const progressAnimation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    // Dot animations with staggered timing
    const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 500,
            delay,
            useNativeDriver: false,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const dotAnimations = Animated.stagger(200, [
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
      createDotAnimation(dot4Anim, 600),
      createDotAnimation(dot5Anim, 800),
    ]);

    // Start animations
    progressAnimation.start((finished) => {
      if (finished && onComplete) {
        onComplete();
      }
    });
    dotAnimations.start();

    return () => {
      progressAnimation.stop();
      dotAnimations.stop();
    };
  }, []);

  return (
    <ScreenContainer
      backgroundColor="$background"

      // paddingHorizontal="$xl"
    >
      <YStack flex={1} justifyContent="center" alignItems="center">
        <YStack
          alignItems="center"
          backgroundColor={"$white"}
          borderRadius={"$full"}
          width={64}
          height={64}
          justifyContent="center"
        >
          <AppImage name="visa" width={55} height={17} />
        </YStack>

        <Spacer size="$4xl" />

        <YStack alignItems="center" gap="$md" marginBottom="$4xl">
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: tokens.color.primary,
              opacity: dot1Anim,
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: tokens.color.primary,
              opacity: dot2Anim,
            }}
          />
          <Animated.View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: tokens.color.primary,
              opacity: dot3Anim,
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: tokens.color.primary,
              opacity: dot4Anim,
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: tokens.color.primary,
              opacity: dot5Anim,
            }}
          />
        </YStack>

        <YStack alignItems="center" marginBottom="$6xl">
          <YStack
            borderRadius="$xl"
            padding="$lg"
            alignItems="center"
            justifyContent="center"
          >
            <AppImage name="bag" width={46} height={52} />
          </YStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};
