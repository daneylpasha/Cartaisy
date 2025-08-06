import colors from "@/assets/colors";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Input, XStack, YStack } from "tamagui";
import { AppImage } from "./AppImage";
import { TextSMSemiBold } from "./texts";

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  icon?: React.ReactNode;
  width?: number | string;
  error?: string;
  borderWidth?: number;
  paddingHorizontal?: number;
}

export const FormInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  paddingHorizontal,
  icon,
  width = "100%",
  error,
  borderWidth = 1,
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <YStack width={width} gap="$md">
      <XStack
        borderWidth={borderWidth}
        borderColor={error ? "red" : "$border"}
        borderRadius="$full"
        padding={"$reg"}
        paddingHorizontal={paddingHorizontal}
        alignItems="center"
        backgroundColor="$white"
      >
        {icon && <XStack marginRight="$2">{icon}</XStack>}
        <YStack flex={1} position="relative">
          <Input
            value={value}
            borderWidth={0}
            onChangeText={onChangeText}
            style={Styles.input}
            backgroundColor="$white"
            placeholder={placeholder}
            placeholderTextColor="$secondary"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword && !showPassword}
            selectionColor={colors.black}
          />
          {!value && !isFocused && (
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              justifyContent="center"
              alignItems="flex-start"
              paddingHorizontal="$sm"
              pointerEvents="none"
              zIndex={0}
            ></YStack>
          )}
        </YStack>

        {isPassword && (
          <Button
            unstyled
            onPress={() => setShowPassword((prev) => !prev)}
            pressStyle={{ opacity: 0.7 }}
            marginLeft="$sm"
          >
            {showPassword ? (
              <AppImage name="eyeOff" width={20} height={20} />
            ) : (
              <AppImage name="eyeOn" width={20} height={20} />
            )}
          </Button>
        )}
      </XStack>

      {error && (
        <>
          <XStack
            alignItems="center"
            gap="$xs"
            borderWidth={1}
            borderColor="red"
            padding="$sm"
            borderRadius="$2xl"
            backgroundColor="#FFF1F2"
          >
            <AppImage name="errorIcon" width={16} height={16} tintColor="red" />
            <TextSMSemiBold color="red">{error}</TextSMSemiBold>
          </XStack>
        </>
      )}
    </YStack>
  );
};

const Styles = StyleSheet.create({
  input: {
    fontSize: 16,
    fontFamily: "figtree",
    fontWeight: "400",
    color: "black",
    padding: 0,
    height: 22,
  },
});
