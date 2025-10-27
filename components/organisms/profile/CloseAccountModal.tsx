import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { t } from "@/translations";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getTokenValue, XStack, YStack } from "tamagui";

import { HeadingXSBold, ParagraphMD, TextMDSemiBold } from "../../atoms";
import { FormInput } from "../../atoms/FormInput";
import { Spacer } from "../../atoms/Spacer";
import AlertModal from "../AlertModal";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
type Props = {
  visible: boolean;
  expectedName: string; // user ka full name, e.g. "John Doe"
  onConfirm: (password: string) => void;
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
    <AlertModal visible={visible} onCancel={onCancel}>
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
        <PrimaryButton
          label="Close Account"
          isLoading={loading}
          background={"red"}
          onPress={() => {
            const password = form.getValues("password");
            if (password) {
              onConfirm(password);
            }
          }}
          icon={
            <AppImage
              name="closeIcon"
              tintColor={getTokenValue("$white")}
              size={13}
            />
          }
          iconPosition="left"
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          color="red"
          borderColor="red"
          onPress={onCancel}
          label="No, Nevermind"
        />
      </YStack>
    </AlertModal>
  );
}
