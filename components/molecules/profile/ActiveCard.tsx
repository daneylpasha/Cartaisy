import Icons from "@/assets/Icons";
import { TextMDBold, TextSMRegular, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { tokens } from "@/tamagui/token";
import React from "react";
import { XStack, YStack } from "tamagui";

type ActiveCardProps = {
  item: {
    id?: number | string;
    image?: keyof typeof Icons | string | null;
    title?: string;
    qty?: number;
    shipping?: string;
    total?: number;
    progress?: string; // Order status
  };
  background?: keyof typeof tokens.color;
};
export const ActiveCard = ({
  item,
  background = "$background" as any,
}: ActiveCardProps) => {
  // Handle image - can be icon name or URL
  const imageSource =
    typeof item.image === "string" && item.image?.startsWith("http")
      ? { uri: item.image }
      : item.image;

  return (
    <YStack padding={"$reg"} backgroundColor={background} borderRadius={"$md"}>
      <XStack>
        <YStack
          width={48}
          height={48}
          borderRadius={"$md"}
          overflow="hidden"
          backgroundColor="$white"
          borderWidth={"$xxxs"}
          borderColor="$lightgrey"
        >
          {typeof imageSource === "object" && imageSource?.uri ? (
            <AppImage
              source={imageSource}
              width={48}
              height={48}
              resizeMode="cover"
            />
          ) : (
            <AppImage name={imageSource as any} width={48} height={48} />
          )}
        </YStack>
        <Spacer size="$reg" />
        <YStack width={245}>
          <TextMDBold color={"$secondary"} numberOfLines={2}>
            {item.title || "Order Item"}
          </TextMDBold>
          <Spacer size="$xs-sm" />
          <XStack alignItems="center">
            <TextSMRegular color="$secondary">{`Qty: ${
              (item.qty ?? 0) > 1 ? `${item.qty} items` : "1 item"
            }`}</TextSMRegular>
            <Spacer size="$sm" />
            <YStack
              width={4}
              height={4}
              borderRadius="$full"
              backgroundColor="$lightgrey"
            />
            <Spacer size="$sm" />
            <TextSMRegular color="$secondary">
              {item.shipping || "Standard"}
            </TextSMRegular>
          </XStack>
        </YStack>
      </XStack>
      <Spacer size="$reg" />
      <Divider />
      <Spacer size="$reg" />
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <TextSMRegular color="$secondary">{"Total cost"}</TextSMRegular>
          <Spacer size="$xs" />
          <TextMDBold>${(item.total ?? 0).toFixed(2)}</TextMDBold>
        </YStack>
        {/* Track button - only show for In Progress orders */}
        {item.progress === "In Progress" && (
          <OpTouch
            onPress={() => {
              console.log("[Track] Tracking order:", item.id);
              // TODO: Navigate to tracking screen
            }}
          >
            <XStack
              alignItems="center"
              paddingHorizontal={"$reg"}
              paddingVertical={"$sm"}
              backgroundColor="$primary"
              borderRadius={"$md"}
            >
              <AppImage name="QrCode" width={11} height={11} />
              <Spacer size="$sm" />
              <TextSMSemiBold color="$white">{"Track"}</TextSMSemiBold>
            </XStack>
          </OpTouch>
        )}
      </XStack>
    </YStack>
  );
};
