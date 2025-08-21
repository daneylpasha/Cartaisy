import { TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { XStack } from "tamagui";
export const PlpOptions = () => {
  return (
    <XStack paddingHorizontal={"$md"}>
      <OpTouch>
        <XStack
          justifyContent="space-between"
          borderWidth={1}
          alignItems="center"
          paddingHorizontal={"$reg"}
          paddingVertical={"$xs-sm"}
          borderRadius={"$full"}
          borderColor={"$lightgrey"}
        >
          <AppImage name={"sortIcon"} size={16} />
          <Spacer size={"$sm"} />
          <TextSMSemiBold textAlign="center">
            {"Sort : Popularity  "}
          </TextSMSemiBold>
          <Spacer size={"$sm"} />
          <AppImage name={"arrowDown"} width={11} height={6} />
        </XStack>
      </OpTouch>
      <Spacer size={"$md"} />
      <OpTouch>
        <XStack
          justifyContent="space-between"
          borderWidth={1}
          alignItems="center"
          paddingHorizontal={"$reg"}
          paddingVertical={"$xs-sm"}
          borderRadius={"$full"}
          borderColor={"$lightgrey"}
        >
          <AppImage name={"filterIcon"} size={16} />
          <Spacer size={"$sm"} />
          <TextSMSemiBold textAlign="center">{"Filter"}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <AppImage name={"arrowDown"} width={11} height={6} />
        </XStack>
      </OpTouch>
    </XStack>
  );
};
