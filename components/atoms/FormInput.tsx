import colors from "@/assets/colors";
import { tokens } from "@/tamagui/token";
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
  textAlignVertical?: "auto" | "top" | "bottom" | "center";
  multiline?: boolean;
  error?: string;
  borderWidth?: number;
  paddingHorizontal?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  numberOfLines?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export const FormInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  paddingHorizontal,
  numberOfLines,
  multiline = false,
  icon,
  width = "100%",
  error,
  borderWidth = 1,
  keyboardType = "default",
  onFocus,
  onBlur,
  onSubmitEditing,
  autoCapitalize = "none",
  backgroundColor = "white",
  borderRadius = tokens.radius.full,
  padding = tokens.space["sm-reg"],
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = secureTextEntry;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <YStack width={width} gap="$md">
      <XStack
        borderWidth={borderWidth}
        borderColor={error ? "red" : "$border"}
        borderRadius={borderRadius}
        padding={padding}
        paddingHorizontal={paddingHorizontal}
        alignItems="center"
        backgroundColor={backgroundColor}
        style={{ backgroundColor: backgroundColor, overflow: "hidden" }}
      >
        {icon ? <XStack marginRight="$2">{icon}</XStack> : null}
        <YStack flex={1} position="relative" style={Styles.inputContainer}>
          <Input
            value={value}
            borderWidth={0}
            onChangeText={onChangeText}
            style={[Styles.input, { backgroundColor: "white" }]}
            multiline={multiline}
            height={"$lg"}
            backgroundColor="white"
            placeholder={placeholder}
            keyboardType={keyboardType}
            numberOfLines={numberOfLines}
            placeholderTextColor="$secondary"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmitEditing}
            returnKeyType="done"
            secureTextEntry={isPassword && !showPassword}
            selectionColor={colors.black}
            autoComplete="off"
            textContentType="none"
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            importantForAutofill="no"
            passwordRules={isPassword ? "" : undefined}
            spellCheck={false}
            keyboardAppearance="default"
            clearButtonMode="never"
            enablesReturnKeyAutomatically={false}
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
    backgroundColor: "transparent",
  },
  inputContainer: {
    backgroundColor: "white",
    overflow: "hidden",
  },
});
