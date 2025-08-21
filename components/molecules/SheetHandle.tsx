import React from "react";
import { YStack } from "tamagui";
import { tokens } from "../../tamagui/token";

interface SheetHandleProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

export const SheetHandle: React.FC<SheetHandleProps> = ({
  width = tokens.size.md,
  height = tokens.space.xs,
  backgroundColor = tokens.color.lightgrey,
  borderRadius = tokens.radius.xs,
}) => {
  return (
    <YStack
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      alignSelf="center"
      marginVertical={tokens.space.sm}
    />
  );
};
