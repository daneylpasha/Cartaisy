import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import React from "react";
import { XStack } from "tamagui";

type CustomHeaderTitleProps = {
  title: string;
};

export const CustomHeaderTitle = ({ title }: CustomHeaderTitleProps) => {
  return (
    <XStack flex={1} justifyContent="center">
      <TextMDBold color="$darkgrey" textAlign="center" numberOfLines={1}>
        {title}
      </TextMDBold>
    </XStack>
  );
};
