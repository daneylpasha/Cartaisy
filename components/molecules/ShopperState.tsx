import Icons from "@/assets/Icons";
import { HeadingSMBold, ParagraphMD, TextMDBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { tokens } from "@/tamagui/token";
import React from "react";
import { YStack } from "tamagui";

type ShopperStateProps = {
  title: string;
  message: string;
  icon: keyof typeof Icons;
  /**
   * `mark` sits a small glyph in a soft brand disc.
   * `illustration` keeps a larger empty-state drawing readable.
   */
  presentation?: "mark" | "illustration";
  illustrationWidth?: number;
  illustrationHeight?: number;
  actionLabel?: string;
  onAction?: () => void;
  minHeight?: number;
};

/**
 * Shared empty and error chrome for browse, product, cart, and account.
 * Brand color comes from the live theme. Copy is passed in so no surface
 * falls back to a Cartaisy wordmark.
 */
export const ShopperState = ({
  title,
  message,
  icon,
  presentation = "mark",
  illustrationWidth = 168,
  illustrationHeight = 140,
  actionLabel,
  onAction,
  minHeight,
}: ShopperStateProps) => {
  const getReactiveColor = useReactiveTokenColor();
  const primaryTint = getReactiveColor("primary") ?? tokens.color.primary;

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="$xl"
      paddingVertical="$2xl"
      minHeight={minHeight}
      testID="shopper-state"
    >
      {presentation === "mark" ? (
        <YStack
          width={88}
          height={88}
          borderRadius="$full"
          backgroundColor="$primarylight"
          alignItems="center"
          justifyContent="center"
        >
          <AppImage
            name={icon}
            width={36}
            height={36}
            tintColor={primaryTint}
          />
        </YStack>
      ) : (
        <AppImage
          name={icon}
          width={illustrationWidth}
          height={illustrationHeight}
          tintColor={primaryTint}
        />
      )}
      <Spacer size="$lg" />
      <HeadingSMBold textAlign="center">{title}</HeadingSMBold>
      <Spacer size="$sm" />
      <ParagraphMD
        color="$textgrey"
        textAlign="center"
        maxWidth={300}
      >
        {message}
      </ParagraphMD>
      {actionLabel && onAction ? (
        <>
          <Spacer size="$xl" />
          <OpTouch
            onPress={onAction}
            backgroundColor="primary"
            paddingHorizontal="xl"
            paddingVertical="reg"
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
          >
            <TextMDBold color="$white">{actionLabel}</TextMDBold>
          </OpTouch>
        </>
      ) : null}
    </YStack>
  );
};
