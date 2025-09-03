import {
  HeadingXSRegular,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { YStack } from "tamagui";
type FullnameForm = {
  fullname: string;
};

const Fullname = () => {
  const form = useForm<FullnameForm>({
    defaultValues: {
      fullname: "",
    },
  });

  const onSubmit = (data: FullnameForm) => {
    router.push("/phoneNumber");
    console.log(data);
  };

  return (
    <ScreenContainer backgroundColor={"$background"}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        <YStack paddingHorizontal={"$md"}>
          <Spacer size={"$2xl"} />
          <AppImage name="bag" width={46} height={52} />
          <Spacer size={"$xl"} />
          <HeadingXSRegular>{t("profile.fullName.title")}</HeadingXSRegular>
          <Spacer size={"$7xl"} />
          <Spacer size={"$8xl"} />
          <TextSMSemiBold>{t("profile.fullName.label")}</TextSMSemiBold>
                 <Spacer size={"$sm"} />
          <Controller
            name="fullname"
            control={form.control}
            rules={{
              required: t("validation.fullNameRequired"),
            }}
            render={({ field, fieldState }) => (
              <FormInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder={t("profile.fullName.placeholder")}
                icon={<AppImage name="userIcon" size={16} />}
                error={fieldState.error?.message}
                onSubmitEditing={form.handleSubmit(onSubmit)}
              />
            )}
          />
          <Spacer size={"$lg"} />
          <YStack alignItems="center" justifyContent="center">
            <AppImage name="userIdentity" width={24} height={24} />
          </YStack>
          <Spacer size={"$md"} />
          <TextSMRegular textAlign="center" color={"$secondary"}>
            {t("profile.fullName.identityMessage")}
          </TextSMRegular>
          <Spacer size={"$5xl"} />
          <YStack>
            <PrimaryButton
              label={t("common.continue")}
              onPress={form.handleSubmit(onSubmit)}
              isLoading={false}
              icon={<AppImage name="arrowRight" size={16} />}
            />
          </YStack>
        </YStack>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default Fullname;
