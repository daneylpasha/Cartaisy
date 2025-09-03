import React, { useCallback } from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getTokenValue, XStack, YStack } from "tamagui";
import { TextMDSemiBold } from "../atoms";

const { width: screenWidth } = Dimensions.get("window");
const SLIDER_WIDTH = screenWidth - 64; // Account for padding
const THUMB_SIZE = 20;
const TRACK_HEIGHT = 4;

interface PriceRangeSliderProps {
  minValue: number;
  maxValue: number;
  initialMinValue?: number;
  initialMaxValue?: number;
  onValueChange?: (min: number, max: number) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minValue,
  maxValue,
  initialMinValue = minValue,
  initialMaxValue = maxValue,
  onValueChange,
}) => {
  const minThumbPosition = useSharedValue(0);
  const maxThumbPosition = useSharedValue(SLIDER_WIDTH - THUMB_SIZE);

  // Get token values outside of animated styles to avoid UI thread issues
  const primaryColor = getTokenValue("$primary");
  const lightGreyColor = getTokenValue("$lightgrey");

  // Initialize positions based on initial values
  React.useEffect(() => {
    const minPercent = (initialMinValue - minValue) / (maxValue - minValue);
    const maxPercent = (initialMaxValue - minValue) / (maxValue - minValue);

    minThumbPosition.value = minPercent * (SLIDER_WIDTH - THUMB_SIZE);
    maxThumbPosition.value = maxPercent * (SLIDER_WIDTH - THUMB_SIZE);
  }, [initialMinValue, initialMaxValue, minValue, maxValue]);

  const calculateValue = useCallback(
    (position: number) => {
      const percent = position / (SLIDER_WIDTH - THUMB_SIZE);
      return Math.round(minValue + percent * (maxValue - minValue));
    },
    [minValue, maxValue]
  );

  const notifyValueChange = useCallback(
    (minPos: number, maxPos: number) => {
      const calculatedMin = calculateValue(minPos);
      const calculatedMax = calculateValue(maxPos);
      onValueChange?.(calculatedMin, calculatedMax);
    },
    [calculateValue, onValueChange]
  );

  const startMinPosition = useSharedValue(0);
  const startMaxPosition = useSharedValue(SLIDER_WIDTH - THUMB_SIZE);

  const minGesture = Gesture.Pan()
    .onStart(() => {
      startMinPosition.value = minThumbPosition.value;
    })
    .onUpdate((event) => {
      const newPosition = clamp(
        startMinPosition.value + event.translationX,
        0,
        maxThumbPosition.value - 20 // Ensure min doesn't go past max
      );
      minThumbPosition.value = newPosition;
    })
    .onEnd(() => {
      // Add subtle spring animation when releasing
      minThumbPosition.value = withSpring(minThumbPosition.value, {
        damping: 15,
        stiffness: 150,
      });
      runOnJS(notifyValueChange)(
        minThumbPosition.value,
        maxThumbPosition.value
      );
    });

  const maxGesture = Gesture.Pan()
    .onStart(() => {
      startMaxPosition.value = maxThumbPosition.value;
    })
    .onUpdate((event) => {
      const newPosition = clamp(
        startMaxPosition.value + event.translationX,
        minThumbPosition.value + 20, // Ensure max doesn't go past min
        SLIDER_WIDTH - THUMB_SIZE
      );
      maxThumbPosition.value = newPosition;
    })
    .onEnd(() => {
      // Add subtle spring animation when releasing
      maxThumbPosition.value = withSpring(maxThumbPosition.value, {
        damping: 15,
        stiffness: 150,
      });
      runOnJS(notifyValueChange)(
        minThumbPosition.value,
        maxThumbPosition.value
      );
    });

  const trackStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: minThumbPosition.value + THUMB_SIZE / 2,
    width: maxThumbPosition.value - minThumbPosition.value,
    height: TRACK_HEIGHT,
    backgroundColor: primaryColor,
    borderRadius: TRACK_HEIGHT / 2,
  }));

  const minThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minThumbPosition.value }],
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxThumbPosition.value }],
  }));

  const getCurrentValues = useCallback(() => {
    const currentMin = calculateValue(minThumbPosition.value);
    const currentMax = calculateValue(maxThumbPosition.value);
    return { min: currentMin, max: currentMax };
  }, [calculateValue]);

  const [displayValues, setDisplayValues] = React.useState(() => {
    const values = getCurrentValues();
    return values;
  });

  React.useEffect(() => {
    const updateDisplayValues = () => {
      setDisplayValues(getCurrentValues());
    };

    const interval = setInterval(updateDisplayValues, 100);
    return () => clearInterval(interval);
  }, [getCurrentValues]);

  return (
    <YStack>
      <XStack
        height={40}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="$sm"
      >
        <YStack
          width={SLIDER_WIDTH}
          height={TRACK_HEIGHT}
          backgroundColor={lightGreyColor}
          borderRadius={TRACK_HEIGHT / 2}
          position="relative"
        >
          {/* Active Track */}
          <Animated.View style={trackStyle} />

          {/* Min Thumb */}
          <GestureDetector gesture={minGesture}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: -8,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  backgroundColor: primaryColor,
                  borderRadius: THUMB_SIZE / 2,
                  borderWidth: 2,
                  borderColor: "white",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                },
                minThumbStyle,
              ]}
            />
          </GestureDetector>

          {/* Max Thumb */}
          <GestureDetector gesture={maxGesture}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: -8,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  backgroundColor: primaryColor,
                  borderRadius: THUMB_SIZE / 2,
                  borderWidth: 2,
                  borderColor: "white",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                },
                maxThumbStyle,
              ]}
            />
          </GestureDetector>
        </YStack>
      </XStack>
      <XStack
        justifyContent="space-between"
        marginBottom="$md"
        paddingHorizontal="$sm"
      >
        <TextMDSemiBold color="$secondary" fontSize={14}>
          ${displayValues.min}
        </TextMDSemiBold>
        <TextMDSemiBold color="$secondary" fontSize={14}>
          ${displayValues.max}
        </TextMDSemiBold>
      </XStack>
    </YStack>
  );
};
