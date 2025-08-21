import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import React from "react";
import { XStack } from "tamagui";

type CustomHeaderTitleProps = {
  title: string;
};

export const CustomHeaderTitle = ({ title }: CustomHeaderTitleProps) => {
  console.log(title, "title");
  return (
    <XStack>
      <TextMDBold color="$textPrimary" textAlign="center">
        {title}
      </TextMDBold>
    </XStack>
  );
};
