import { View } from "tamagui";
import { tokens } from "../../tamagui/token";

type SpaceTokenKey = keyof typeof tokens.space;
type SpacerProps = {
  size: `$${SpaceTokenKey}` | number; // Example: "$lg" or 24
};

export function Spacer({ size }: SpacerProps) {
  // Get exact pixel value from tokens
  const getPixelValue = (token: string | number): number => {
    if (typeof token === "number") return token;

    // Remove $ from token name
    const tokenName = token.replace("$", "") as SpaceTokenKey;

    // Get value from tokens
    const tokenValue = tokens.space[tokenName];

    return typeof tokenValue === "number" ? tokenValue : 0;
  };

  const pixelValue = getPixelValue(size);

  return (
    <View
      pointerEvents="none"
      backgroundColor="transparent"
      width={pixelValue}
      height={pixelValue}
    />
  );
}
