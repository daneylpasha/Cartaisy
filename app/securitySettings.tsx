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

interface SecurityItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  enabled: boolean;
}

interface SecuritySection {
  title: string;
  data: SecurityItem[];
}

const SecuritySettings = () => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  const [securityStates, setSecurityStates] = useState<Record<string, boolean>>(
    {
      autolockScreen: false,
      rememberLoginEmail: true,
      useFaceID: true,
      twoFactorAuth: false,
      otherSecuritySettings: false,
    }
  );

  const securitySections: SecuritySection[] = [
    {
      title: "",
      data: [
        {
          id: "rememberLoginEmail",
          title: "Remember Login Email",
          icon: "passwordChange",
          iconColor: tokens.color.primary,
          enabled: securityStates.rememberLoginEmail,
        },
        {
          id: "useFaceID",
          title: "Use FaceID",
          icon: "scanner",
          iconColor: tokens.color.primary,
          enabled: securityStates.useFaceID,
        },
      ],
    },
  ];

  const toggleSecurity = (id: string) => {
    setSecurityStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }: { item: SecurityItem }) => (
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

        <ToggleSwitch
          value={!!securityStates[item.id]}
          onValueChange={() => toggleSecurity(item.id)}
        />
      </XStack>
    </YStack>
  );

  const renderSectionHeader = ({ section }: { section: SecuritySection }) => {
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
        sections={securitySections}
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
            <HeadingSMBold>{t("securitySettings.title")}</HeadingSMBold>
            <Spacer size="$sm" />
            <ParagraphMD color={"$secondary"}>
              {t("securitySettings.subtitle")}
            </ParagraphMD>
          </YStack>
        )}
        stickySectionHeadersEnabled={false}
        extraData={securityStates}
      />
    </YStack>
  );
};

export default SecuritySettings;
