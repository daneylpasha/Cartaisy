import Icons from "@/assets/Icons";
import { TextLGBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { tokens } from "@/tamagui/token";
import React from "react";
import { getTokenValue, XStack, YStack } from "tamagui";
type IconName = keyof typeof Icons;

export type WishListItemProps = {
  image: IconName;
  title: string;
  totalItems: number;
  totalItemsOnSale: number;
};

const WishListItem = (props: WishListItemProps) => {
  const { image, title, totalItems, totalItemsOnSale } = props;

  return (
    <>
      <Spacer size={"$reg"} />
      <XStack
        paddingHorizontal={"$md"}
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack>
          <YStack
            overflow="hidden"
            borderWidth={1}
            borderColor="$lightgrey"
            backgroundColor="$white"
            borderRadius={tokens.space.sm}
            width={64}
            height={64}
          >
            <AppImage
              resizeMode="contain"
              name={image}
              width={64}
              height={64}
            />
          </YStack>
          <Spacer size={"$reg"} />
          <YStack>
            <TextLGBold color="$secondary">{title}</TextLGBold>
            <Spacer size={"$xs-sm"} />
            <TextMDRegular color="$secondary">
              Default .{totalItems} items
            </TextMDRegular>
            <Spacer size={"$xs-sm"} />
            <XStack alignItems="center">
              <AppImage
                name="dealIcon"
                tintColor={getTokenValue("$green")}
                width={16}
                height={16}
              />
              <Spacer size={"$xs-sm"} />
              <TextMDRegular color="$secondary">
                {totalItems - totalItemsOnSale} items are on sale
              </TextMDRegular>
            </XStack>
          </YStack>
        </XStack>

        <OpTouch onPress={() => {}}>
          <AppImage
            name="caretRight"
            tintColor={getTokenValue("$secondary")}
            width={9}
            height={16}
          />
        </OpTouch>
      </XStack>
    </>
  );
};

export default WishListItem;
