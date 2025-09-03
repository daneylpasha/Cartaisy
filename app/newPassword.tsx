import { HeadingSMBold, ParagraphLG, TextMDMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t, tArray } from "@/translations";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, ListRenderItem } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
type newPasswordForm = {
  password: string;
};
const ListsItem = tArray("newpassword.Lists");
const NewPassword = () => {
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const form = useForm<newPasswordForm>({
    defaultValues: {
      password: "",
    },
  });

  const pwd = form.watch("password");

  useEffect(() => {
    if (errorBanner && pwd === "1234567") {
      setErrorBanner(null);
    }
  }, [pwd, errorBanner]);

  const onSubmit = async (data: newPasswordForm) => {
    router.push("/(auth)/login");
    Alert.alert("Password Changed Sucessfully");
  };

  const renderLists: ListRenderItem<string> = ({ item }) => (
    <XStack alignItems="center">
      <YStack
        alignItems="center"
        justifyContent="center"
        width={20}
        height={20}
        borderRadius={"$full"}
        backgroundColor={getTokenValue("$primary")}
      >
        <AppImage
          tintColor={getTokenValue("$white")}
          name={"check"}
          width={12}
          height={12}
        />
      </YStack>
      <Spacer size={"$sm"} />
      <TextMDMedium>{item}</TextMDMedium>
    </XStack>
  );

  return (
    <YStack
      alignItems="center"
      flex={1}
      backgroundColor={"$background"}
      paddingHorizontal={"$md"}
    >
      <Spacer size={"$3xl"} />
      <AppImage name="shieldFrame" width={106} height={141} />
      <Spacer size={"$xl"} />
      <HeadingSMBold>{t("newpassword.title")}</HeadingSMBold>
      <Spacer size={"$reg"} />
      <ParagraphLG color={"$secondary"}>
        {t("newpassword.subtitle")}
      </ParagraphLG>
      <Spacer size={"$xl"} />
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
            placeholder={"••••••••••••"}
            icon={
              <AppImage
                name="lockUnfilled"
                tintColor={getTokenValue("$icon")}
                size={16}
              />
            }
            secureTextEntry
            onSubmitEditing={form.handleSubmit(onSubmit)}
            // error={fieldState.error?.message}
          />
        )}
      />
      <Spacer size={"$md"} />

      <Spacer size={"$md"} />
      <YStack width="100%">
        <FlatList
          data={ListsItem}
          renderItem={renderLists}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
          style={{ flexGrow: 0 }}
        />
      </YStack>
      <Spacer size={"$xl"} />
      <YStack width="100%" paddingBottom={"$md"}>
        <PrimaryButton
          label={t("newpassword.title")}
          onPress={form.handleSubmit(onSubmit)}
          icon={
            <AppImage
              name="lockIcon"
              tintColor={getTokenValue("$white")}
              size={15}
            />
          }
          isLoading={false}
        />
      </YStack>
    </YStack>
  );
};

export default NewPassword;
