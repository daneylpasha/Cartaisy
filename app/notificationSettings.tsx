import {
  HeadingSMBold,
  ParagraphMD,
  TextMDBold,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { ToggleSwitch } from "@/components/molecules/ToggleSwitch";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { useState } from "react";
import { SectionList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  enabled: boolean;
}

interface NotificationSection {
  title: string;
  data: NotificationItem[];
}

const NotificationSettings = () => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  const [notificationStates, setNotificationStates] = useState<
    Record<string, boolean>
  >({
    customerService: true,
    shipments: false,
    recommendations: true,
    wishlist: false,
    referralPromotions: false,
    communityNotifications: false,
  });
  const notificationSections: NotificationSection[] = [
    {
      title: "Customer Service",
      data: [
        {
          id: "customerService",
          title: "Customer Service",
          description: "Shake your phone to randomize your account balances.",
          icon: "clock",
          iconColor: tokens.color.primary,
          enabled: notificationStates.customerService,
        },
      ],
    },
    {
      title: "",
      data: [
        {
          id: "shipments",
          title: "Your shipments",
          description: "Shake your phone to randomize your account balances.",
          icon: "notification",
          iconColor: tokens.color.primary,
          enabled: notificationStates.shipments,
        },
        {
          id: "recommendations",
          title: "Your recommendations",
          icon: "recommend",
          iconColor: tokens.color.primary,
          enabled: notificationStates.recommendations,
        },
        {
          id: "wishlist",
          title: "Your Wishlist",
          description: "Send budget and goal reminders via your emails",
          icon: "heart",
          iconColor: tokens.color.primary,
          enabled: notificationStates.wishlist,
        },
      ],
    },
    {
      title: "Promotions",
      data: [
        {
          id: "referralPromotions",
          title: "Referral Promotions",
          icon: "gift",
          iconColor: tokens.color.primary,
          enabled: notificationStates.referralPromotions,
        },
      ],
    },
    {
      title: "Community",
      data: [
        {
          id: "communityNotifications",
          title: "Community Notifications",
          icon: "gift",
          iconColor: tokens.color.primary,
          enabled: notificationStates.communityNotifications,
        },
      ],
    },
  ];

  const toggleNotification = (id: string) => {
    setNotificationStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <YStack backgroundColor="$white" borderRadius="$2xl" padding="$reg">
      <XStack alignItems="center" justifyContent="space-between" gap={10}>
        <XStack alignItems="center" flex={1}>
          <AppImage
            name={item.icon as any}
            width={19}
            height={15}
            tintColor={item.iconColor || tokens.color.primary}
          />
          <Spacer size={"$reg"} />
          <YStack flex={1}>
            <TextSMSemiBold>{item.title}</TextSMSemiBold>
            {item.description && (
              <ParagraphSM color={"$secondary"}>{item.description}</ParagraphSM>
            )}
          </YStack>
        </XStack>

        {/* ✅ per-item value & handler */}
        <ToggleSwitch
          value={!!notificationStates[item.id]}
          onValueChange={() => toggleNotification(item.id)}
        />
      </XStack>
    </YStack>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: NotificationSection;
  }) => {
    if (!section.title) return <Spacer size="$sm" />;

    return (
      <YStack>
        <Spacer size={"$lg"} />
        <TextMDBold>{section.title}</TextMDBold>
        <Spacer size={"$reg"} />
      </YStack>
    );
  };

  return (
    <YStack
      backgroundColor="$background"
      paddingBottom={bottomSafeAreaInset}
      flex={1}
    >
      <SectionList
        sections={notificationSections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <Spacer size={"$reg"} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: getTokenValue("$md"),
          paddingBottom: bottomSafeAreaInset + getTokenValue("$lg"),
        }}
        ListHeaderComponent={() => (
          <YStack marginBottom="$lg">
            <HeadingSMBold>{t("notificationSettings.title")}</HeadingSMBold>
            <Spacer size="$sm" />
            <ParagraphMD color={"$secondary"}>
              {t("notificationSettings.subtitle")}
            </ParagraphMD>
          </YStack>
        )}
        stickySectionHeadersEnabled={false}
        extraData={notificationStates}
      />
    </YStack>
  );
};

export default NotificationSettings;
