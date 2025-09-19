import {
  HeadingSMBold,
  TextMDMedium,
  TextMDSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { LabelMD } from "@/components/atoms/texts/LabelMD";
import { ParagraphLG } from "@/components/atoms/texts/ParagraphLG";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { t, tArray } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { FlatList, ListRenderItem } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

const ListsItems = tArray("welcome.Lists");

const WellcomeScreen = () => {
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
    <ScreenContainer backgroundColor={"background"}>
      <Spacer size={"$2xl"} />
      <YStack paddingHorizontal={"$md"} alignItems="center">
        <YStack
          shadowColor={"$primary"}
          shadowOffset={{ width: 0, height: 10 }}
          shadowOpacity={0.2}
          shadowRadius={4}
          backgroundColor="transparent"
        >
          <AppImage
            tintColor={"$primary"}
            name={"bag"}
            width={47}
            height={53}
          />
        </YStack>
        <Spacer size={"$xl"} />
        <LabelMD color={"$primary"} textAlign="center">
          {t("common.companyName").toUpperCase()}
        </LabelMD>
        <Spacer size={"$md-lg"} />
        <HeadingSMBold textAlign="center">{t("welcome.title")}</HeadingSMBold>
        <Spacer size={"$md-lg"} />
        <ParagraphLG color={"$secondary"} textAlign="center">
          {t("welcome.subtitle")}
        </ParagraphLG>
      </YStack>
      <Spacer size={"$2xl"} />
      <YStack paddingHorizontal={"$lg"}>
        <FlatList
          data={ListsItems}
          renderItem={renderLists}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
        />
      </YStack>
      <Spacer size={"$3xl"} />
      <YStack paddingHorizontal={"$md"}>
        <PrimaryButton
          isLoading={false}
          onPress={() => router.push("/(auth)/signUp")}
          label={t("welcome.signUp")}
          iconPosition="right"
          icon={<AppImage name={"arrowRight"} size={20} />}
        />
      </YStack>
      <Spacer size={"$lg"} />
      <XStack justifyContent="center" alignItems="center">
        <OpTouch onPress={() => router.push("/(auth)/login")}>
          <XStack alignItems="center">
            <AppImage  tintColor={getTokenValue("$primary")} name={"loginIcon"} size={20} />
            <Spacer size={"$sm-reg"} />
            <TextMDSemiBold color={"$primary"}>
              {t("welcome.alreadyHaveAccount")}
            </TextMDSemiBold>
          </XStack>
        </OpTouch>
      </XStack>
    </ScreenContainer>
  );
};

export default WellcomeScreen;
