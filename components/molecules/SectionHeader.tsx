import Icons from "@/assets/Icons";
import { tokens } from "@/tamagui/token";
import React from "react";
import { XStack } from "tamagui";
import { TextLGBold, TextMDMedium } from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { OpTouch } from "../atoms/OpTouch";
import { Spacer } from "../atoms/Spacer";

type SectionHeaderProps = {
  title: string;
  image?: keyof typeof Icons;
  showImage?: boolean;
  showSeeAll?: boolean;
  seeAllText?: string;
  onPressSeeAll?: () => void;
  tintColor?: keyof typeof tokens.color;
  color?: keyof typeof tokens.color;
};

export const SectionHeader = ({
  title,
  image,
  showImage = true,
  showSeeAll = true,
  seeAllText,
  onPressSeeAll,
  tintColor,
  color = "darkgrey",
}: SectionHeaderProps) => {
  return (
    <XStack
      paddingHorizontal={"$md"}
      alignItems="center"
      justifyContent="space-between"
    >
      <XStack alignItems="center">
        {showImage && (
          <AppImage
            tintColor={tintColor ? tokens.color[tintColor] : undefined}
            name={image}
            width={20}
            height={20}
          />
        )}
        <Spacer size={"$xs-sm"} />
        <TextLGBold color={"$darkgrey"}>{title}</TextLGBold>
      </XStack>
      {showSeeAll && seeAllText && (
        <OpTouch onPress={onPressSeeAll}>
          <TextMDMedium color={`$${color}`}>{seeAllText}</TextMDMedium>
        </OpTouch>
      )}
    </XStack>
  );
};
