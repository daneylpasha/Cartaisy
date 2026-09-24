import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingXSBold } from "@/components/atoms/texts/HeadingXSBold";
import { ParagraphMD } from "@/components/atoms/texts/ParagraphMD";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { SecondaryButton } from "@/components/molecules/buttons";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { useCompanyName } from "@/hooks/useCompanyName";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { t } from "@/translations";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Linking } from "react-native";
import { YStack } from "tamagui";

const PasswordRestSent = () => {
  const { email, from } = useLocalSearchParams<{
    email?: string;
    from?: string;
  }>();
  const companyName = useCompanyName();
  const getReactiveColor = useReactiveTokenColor();
  const primaryTint = getReactiveColor("primary");

  const openSupportEmail = async () => {
    const subject = companyName ? `${companyName} account help` : "Account help";
    const mailto = `mailto:help@cartaisy.com?subject=${encodeURIComponent(subject)}`;
    try {
      const can = await Linking.canOpenURL(mailto);
      if (can) {
        await Linking.openURL(mailto);
      }
    } catch {
      Alert.alert("Couldn't open email", "Please try again from your mail app.");
    }
  };

  const openEmailApp = async () => {
    const emailDomain = email?.split("@")[1];

    // Common email providers with their deep links
    const emailApps: { [key: string]: string } = {
      "gmail.com": "googlegmail://",
      "yahoo.com": "ymail://",
      "outlook.com": "ms-outlook://",
      "hotmail.com": "ms-outlook://",
      "icloud.com": "message://",
      "me.com": "message://",
    };

    try {
      // Try to open specific email app based on domain
      if (emailDomain && emailApps[emailDomain]) {
        const canOpen = await Linking.canOpenURL(emailApps[emailDomain]);
        if (canOpen) {
          await Linking.openURL(emailApps[emailDomain]);
          return;
        }
      }

      // Fallback to default mail app
      const mailUrl = "message://";
      const canOpenMail = await Linking.canOpenURL(mailUrl);
      if (canOpenMail) {
        await Linking.openURL(mailUrl);
        return;
      }

      // If no mail app found, show alert
      Alert.alert(
        "No Email App Found",
        "Please check your email app manually to find the password reset link.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not open email app. Please check your email manually.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ScreenContainer backgroundColor={"background"}>
      <Spacer size={"$6xl"} />
      <AppImage
        name="emailSent"
        tintColor={primaryTint}
        height={250}
      />
      <Spacer size={"$xl"} />
      <YStack paddingHorizontal={"$md"} alignItems="center">
        <HeadingXSBold>{t("auth.passwordResetSent.title")}</HeadingXSBold>
        <Spacer size={"$sm"} />
        {/* <ParagraphMD color={"$secondary"} textAlign="center">
          {t("auth.passwordResetSent.subtitle")}
        </ParagraphMD> */}
        <ParagraphMD color={"$secondary"} textAlign="center">
          {`Please check your email in a few minutes - we've sent you an email at ${email} containing password recovery link.`}
        </ParagraphMD>
        <Spacer size={"$lg"} />
        <PrimaryButton
          isLoading={false}
          label={t("auth.passwordResetSent.openEmailApp")}
          onPress={openEmailApp}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton label="Back to sign in" onPress={() => router.dismissAll()} />
        <Spacer size={"$xl"} />
        <YStack alignItems="center">
          <TextSMRegular color={"$secondary"}>
            {t("auth.passwordResetSent.dontRememberEmail")}
          </TextSMRegular>
          <OpTouch onPress={openSupportEmail}>
            <TextSMRegular
              borderBottomWidth={1}
              fontWeight={"700"}
              color={"$primary"}
            >
              {t("auth.passwordResetSent.contactSupport")}
            </TextSMRegular>
          </OpTouch>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default PasswordRestSent;
