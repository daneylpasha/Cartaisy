import { AppImage } from "@/components/atoms/AppImage";
import { TextMDBold } from "@/components/atoms/texts";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { PrimaryButton } from "@/components/molecules/buttons";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { StyleSheet } from "react-native";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";

export const PromoBannerCard = () => {
  return (
    <YStack paddingHorizontal={"$md"}>
      <XStack
        width="100%"
        borderTopLeftRadius={"$2xl"}
        borderBottomLeftRadius={"$2xl"}
        justifyContent="space-between"
        backgroundColor={"$white"}
      >
        {/* Left Section */}
        <YStack padding={"$md"} width={"60%"}>
          <TextMDBold color="$darkgrey">
            {t("home.promoBannerCard.title")}
          </TextMDBold>

          <Spacer size="$sm" />

          <ParagraphSM color="$textgrey">
            {t("home.promoBannerCard.subtitle")}
          </ParagraphSM>

          <Spacer size="$reg" />

          <PrimaryButton
            width={"80%"}
            label={t("home.promoBannerCard.buttonText")}
            paddingVertical="xs"
            icon={
              <AppImage
                name="arrowRight"
                tintColor={getTokenValue("$white")}
                width={16}
                height={16}
              />
            }
            onPress={() => {}}
            isLoading={false}
          />
        </YStack>

        {/* Right Image */}
        <AppImage style={Styles.ImageStyle} width={128} name="promoBanner" />
      </XStack>
    </YStack>
  );
};

const Styles = StyleSheet.create({
  ImageStyle: {
    borderTopRightRadius: tokens.radius["2xl"],
    borderBottomRightRadius: tokens.radius["2xl"],
  },
});
