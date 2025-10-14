import { HeadingSMBold, ParagraphMD, TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { t } from "@/translations";
import { tokens } from "@/tamagui/token";

import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { XStack, YStack } from "tamagui";

export const EmptySearches = () => {
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
        tintColor={tokens.color.primary}
      />
      <Spacer size={"$xl"} />
      <HeadingSMBold textAlign="center">
        {t("search.emptySearches.title")}
      </HeadingSMBold>
      <Spacer size={"$reg"} />
      <ParagraphMD color="$textgrey" textAlign="center">
        {t("search.emptySearches.subtitle")}
      </ParagraphMD>
      <Spacer size={"$xl"} />
      <XStack justifyContent="center" flexWrap="wrap" gap={"$sm"}>
        <OpTouch>
          <XStack
            alignItems="center"
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius={"$full"}
            paddingHorizontal={"$reg"}
            paddingVertical={"$xs-sm"}
          >
            <AppImage name={"collectionBeauty"} size={16} />
            <Spacer size={"$xs-sm"} />
            <TextSMMedium color="$textgrey" textAlign="center">
              {"Fashion"}
            </TextSMMedium>
          </XStack>
        </OpTouch>
        <OpTouch>
          <XStack
            alignItems="center"
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius={"$full"}
            paddingHorizontal={"$reg"}
            paddingVertical={"$xs-sm"}
          >
            <AppImage name={"computer"} size={16} />
            <Spacer size={"$xs-sm"} />
            <TextSMMedium color="$textgrey" textAlign="center">
              {"Electronics"}
            </TextSMMedium>
          </XStack>
        </OpTouch>
        <OpTouch>
          <XStack
            alignItems="center"
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius={"$full"}
            paddingHorizontal={"$reg"}
            paddingVertical={"$xs-sm"}
          >
            <AppImage name={"offerIcon"} size={16} />
            <Spacer size={"$xs-sm"} />
            <TextSMMedium color="$textgrey" textAlign="center">
              {"Offers"}
            </TextSMMedium>
          </XStack>
        </OpTouch>

        <OpTouch>
          <XStack
            alignItems="center"
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius={"$full"}
            paddingHorizontal={"$reg"}
            paddingVertical={"$xs-sm"}
          >
            <AppImage name={"collectionAutomotive"} size={16} />
            <Spacer size={"$xs-sm"} />
            <TextSMMedium color="$textgrey" textAlign="center">
              {"Automative"}
            </TextSMMedium>
          </XStack>
        </OpTouch>
      </XStack>
    </YStack>
  );
};
