import { OpTouch } from "@/components/atoms/OpTouch";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated } from "react-native";
import { XStack } from "tamagui";

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  width?: number;
  height?: number;
};

export function ToggleSwitch({
  value,
  onValueChange,
  disabled,
  width = 52,
  height = 30,
}: Props) {
  const pad = 3;
  const knob = useMemo(() => height - pad * 2, [height]);
  const travel = useMemo(() => width - pad * 2 - knob, [width, knob]);

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });

  return (
    <OpTouch
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={() => !disabled && onValueChange(!value)}
    >
      <XStack
        width={width}
        height={height}
        borderRadius={height / 2}
        alignItems="center"
        backgroundColor={value ? "$primary" : "$grey"}
        paddingLeft={pad}
        paddingRight={pad}
      >
        <Animated.View
          style={{
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            backgroundColor: "white",
            transform: [{ translateX }],
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          }}
        />
      </XStack>
    </OpTouch>
  );
}
