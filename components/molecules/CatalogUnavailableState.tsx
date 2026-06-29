import { HeadingSMBold, ParagraphMD, TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { getCatalogUnavailableMessage } from "@/utils/catalogUnavailableError";
import { getTokenValue, YStack } from "tamagui";

type CatalogUnavailableStateProps = {
  error?: unknown;
  minHeight?: number;
  message?: string;
  onRetry?: () => void;
  title?: string;
};

export const CatalogUnavailableState = ({
  error,
  minHeight,
  message,
  onRetry,
  title = "Catalog unavailable",
}: CatalogUnavailableStateProps) => {
  const fallbackMessage =
    message ||
    getCatalogUnavailableMessage(error) ||
    "We couldn't load this catalog. Please try again.";

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$lg"
      backgroundColor="$background"
      minHeight={minHeight}
    >
      <AppImage
        name="warningIcon"
        size={48}
        tintColor={getTokenValue("$primary")}
      />
      <Spacer size="$lg" />
      <HeadingSMBold textAlign="center">{title}</HeadingSMBold>
      <Spacer size="$reg" />
      <ParagraphMD color="$textgrey" textAlign="center">
        {fallbackMessage}
      </ParagraphMD>
      {onRetry ? (
        <>
          <Spacer size="$xl" />
          <OpTouch onPress={onRetry}>
            <YStack
              borderWidth={1}
              borderColor="$primary"
              borderRadius="$md"
              paddingHorizontal="$lg"
              paddingVertical="$sm"
            >
              <TextSMMedium color="$primary">Try again</TextSMMedium>
            </YStack>
          </OpTouch>
        </>
      ) : null}
    </YStack>
  );
};
