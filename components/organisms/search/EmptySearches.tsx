import { HeadingSMBold, ParagraphMD } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React from "react";
import { YStack } from "tamagui";

export const EmptySearches = () => {
  const getReactiveColor = useReactiveTokenColor();
  const primaryTint = getReactiveColor("primary") ?? tokens.color.primary;

  return (
    <YStack
      justifyContent="center"
      paddingHorizontal={"$md"}
      alignItems="center"
    >
      <Spacer size={138} />
      <AppImage
        name={"researchIcon"}
        size={197}
        tintColor={primaryTint}
      />
      <Spacer size={"$xl"} />
      <HeadingSMBold textAlign="center">
        {t("search.emptySearches.title")}
      </HeadingSMBold>
      <Spacer size={"$reg"} />
      <ParagraphMD color="$textgrey" textAlign="center">
        {t("search.emptySearches.subtitle")}
      </ParagraphMD>
    </YStack>
  );
};
