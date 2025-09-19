import authApi from "@/api/endpoints/auth";
import {
  HeadingSMBold,
  LabelMD,
  ParagraphMD,
  ParagraphXS,
  TextMDSemiBold,
  TextSMRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import useAuthStore from "@/store/useAuthStore";
import { t } from "@/translations";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
const Notification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasDeniedBefore, setHasDeniedBefore] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    checkIfUserDeniedBefore();
  }, []);

  const checkIfUserDeniedBefore = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "denied") {
      setHasDeniedBefore(true);
    }
  };

  const updatePushNotificationStatus = async (enabled: boolean) => {
    if (!token) return;

    try {
      await authApi.completeProfile(
        {
          preferences: {
            notifications: {
              push: enabled,
            },
          },
        },
        token
      );
      console.log("Push notification status updated:", enabled);
    } catch (error) {
      console.error("Error updating push notification status:", error);
    }
  };

  const openSettings = () => {
    Alert.alert(
      "Enable Notifications",
      "Please enable notifications from your device settings to receive updates about your orders.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => router.push("/(tabs)"),
        },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
            router.push("/(tabs)");
          },
        },
      ]
    );
  };

  const requestNotificationPermission = async () => {
    setIsLoading(true);
    try {
      // Check current permission status first
      const { status: currentStatus } =
        await Notifications.getPermissionsAsync();

      // If already denied, directly open settings
      if (currentStatus === "denied" || hasDeniedBefore) {
        openSettings();
        return;
      }

      // Otherwise request permission
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        // Permission granted - hit the API
        await updatePushNotificationStatus(true);
        // Navigate to tabs after permission granted
        router.push("/(tabs)");
      } else if (status === "denied") {
        // Permission denied - show alert to open settings
        openSettings();
      } else {
        // Permission undetermined or other status
        router.push("/(tabs)");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      router.push("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ScreenContainer>
      <YStack paddingHorizontal={"$md"}>
        <Spacer size={"$6xl"} />
        <HeadingSMBold textAlign="center">
          {t("notification.title")}
        </HeadingSMBold>
        <Spacer size={"$reg"} />
        <ParagraphMD textAlign="center">
          {t("notification.subtitle")}
        </ParagraphMD>
        <Spacer size={"$2xl"} />
        <YStack alignItems="center" position="relative">
          <AppImage name="notificationFrame" width={350} height={250} />
          <YStack
            width={289}
            height={94}
            position="absolute"
            top={130}
            left={27}
            right={0}
            bottom={0}
            marginHorizontal="auto"
            backgroundColor="$white"
            borderRadius={"$2xl"}
            padding={"$md"}
          >
            <XStack alignItems="center" justifyContent="space-between">
              <XStack>
                <AppImage name="bag" width={17} height={19} />
                <Spacer size={"$xxs"} />
                <LabelMD letterSpacing={0}>{t("common.companyName")}</LabelMD>
              </XStack>
              <TextSMRegular color={"$secondary"}>{"3s ago"}</TextSMRegular>
            </XStack>
            <ParagraphXS color={"$secondary"}>
              {t("notification.notificationExample")}
            </ParagraphXS>
          </YStack>
        </YStack>
        <Spacer size={"$xs-sm"} />
        <XStack alignItems="center" justifyContent="center">
          <AppImage
            name="errorIcon"
            tintColor={getTokenValue("$secondary")}
            width={16}
            height={16}
          />
          <Spacer size={"$xxs"} />
          <TextSMRegular color={"$secondary"}>
            {t("notification.changeSettings")}
          </TextSMRegular>
        </XStack>
        <Spacer size={"$2xl"} />
        <PrimaryButton
          label={t("common.notification")}
          onPress={requestNotificationPermission}
          icon={<AppImage name="check" size={20} />}
          isLoading={isLoading}
        />
        <Spacer size={"$lg"} />
        <OpTouch onPress={() => router.push("/(tabs)")}>
          <TextMDSemiBold textAlign="center" color={"$primary"}>
            {t("common.nopeMaybeLater")}
          </TextMDSemiBold>
        </OpTouch>
      </YStack>
    </ScreenContainer>
  );
};

export default Notification;
