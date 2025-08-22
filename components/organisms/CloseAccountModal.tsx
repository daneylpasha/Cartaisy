import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { t } from "@/translations";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, Platform, Pressable } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

import { HeadingXSBold, ParagraphMD, TextMDSemiBold } from "../atoms";
import { FormInput } from "../atoms/FormInput";
import { Spacer } from "../atoms/Spacer";
type Props = {
  visible: boolean;
  expectedName: string; // user ka full name, e.g. "John Doe"
  onConfirm: () => void;
  onCancel: () => void;
  avatarUri?: string; // optional avatar
  loading?: boolean; // close button spinner state (agar aap add karna chahen)
};
type PasswordForm = {
  password: string;
};
export default function CloseAccountModal({
  visible,
  expectedName,
  onConfirm,
  onCancel,
  avatarUri,
  loading,
}: Props) {
  const [name, setName] = useState("");
  const form = useForm<PasswordForm>({
    defaultValues: {
      password: "",
    },
  });
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === "ios" ? "slide" : "fade"}
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}
      />

      {/* Card */}
      <YStack
        position="absolute"
        left={16}
        right={16}
        borderRadius={"$3xl"}
        top={"30%"}
        backgroundColor={"$white"}
        paddingHorizontal={"$md"}
        paddingVertical={"$reg"}
      >
        {/* Title + subtitle */}
        <YStack alignItems="center">
          <HeadingXSBold textAlign="center">
            Are you sure to close{"\n"}your account?
          </HeadingXSBold>
          <Spacer size={"$reg"} />
          <YStack marginTop={8}>
            <ParagraphMD color={"$secondary"}>
              Please type your full name to proceed
            </ParagraphMD>
          </YStack>
        </YStack>
        <Spacer size={"$lg"} />
        {/* Input (pill) */}
        <Controller
          name="password"
          control={form.control}
          rules={{
            required: t("validation.passwordRequired"),
            minLength: {
              value: 6,
              message: t("validation.passwordMinLength"),
            },
          }}
          render={({ field, fieldState }) => (
            <FormInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder={"Enter Password"}
              icon={
                <AppImage
                  name="lockUnfilled"
                  tintColor={getTokenValue("$icon")}
                  size={16}
                />
              }
              secureTextEntry
              error={fieldState.error?.message}
            />
          )}
        />
        <Spacer size={"$lg"} />
        <OpTouch onPress={onConfirm}>
          <XStack
            height={52}
            borderRadius={26}
            alignItems="center"
            justifyContent="center"
            backgroundColor={"red"}
            borderWidth={2}
            borderColor={"#EF4444"}
          >
            <AppImage
              name="closeIcon"
              tintColor={getTokenValue("$white")}
              size={13}
            />
            <Spacer size={"$reg"} />
            <TextMDSemiBold color={"$white"}>Close Account</TextMDSemiBold>
          </XStack>
        </OpTouch>
        <Spacer size={"$reg"} />
        <OpTouch onPress={onCancel}>
          <XStack
            height={52}
            borderRadius={26}
            alignItems="center"
            justifyContent="center"
            backgroundColor={"transparent"}
            borderWidth={0.7}
            borderColor={"$error"}
          >
            <TextMDSemiBold color={"$error"}>No, Nevermind</TextMDSemiBold>
          </XStack>
        </OpTouch>
      </YStack>
    </Modal>
  );
}
