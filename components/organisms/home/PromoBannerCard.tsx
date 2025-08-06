import { AppImage } from "@/components/atoms/AppImage";
import { TextMDBold } from "@/components/atoms/texts";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { PrimaryButton } from "@/components/molecules/buttons";
import { tokens } from "@/tamagui/token";
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
        height={172}
      >
        {/* Left Section */}
        <YStack padding={"$md"} width={215}>
          <TextMDBold color="$darkgrey">
            Health & Fitness 25% OFF Promo Madness!
          </TextMDBold>

          <Spacer size="$sm" />

          <ParagraphSM color="$textgrey">
            Enhance your health and get healthier today.
          </ParagraphSM>

          <Spacer size="$reg" />

          <PrimaryButton
            width={150}
            label="Browse Deals"
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
