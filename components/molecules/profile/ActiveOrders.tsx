import { TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { router } from "expo-router";
import { XStack, YStack } from "tamagui";

export const ActiveOrders = ({
  activeOrders,
}: //   showOrder = true,
{
  activeOrders: number;
  //   showOrder?: boolean;
}) => {
  const getReactiveColor = useReactiveTokenColor();
  const primaryTint = getReactiveColor("primary");
  const title =
    activeOrders === 1
      ? "You have 1 active order"
      : `You have ${activeOrders} active orders`;
  const detail =
    activeOrders === 0
      ? "When you place an order, it will show up here."
      : "On the way.";

  return (
    <XStack>
      <YStack
        backgroundColor={"$primarylight"}
        borderRadius={"$full"}
        width={40}
        height={40}
        justifyContent="center"
        alignItems="center"
      >
        <AppImage
          name="cartIcon"
          tintColor={primaryTint}
          width={21}
          height={19}
        />
      </YStack>
      <Spacer size="$reg" />
      <YStack flex={1}>
        <TextMDBold>{title}</TextMDBold>
        <Spacer size="$xs" />
        <TextSMRegular color={"$secondary"}>{detail}</TextSMRegular>
      </YStack>
      {activeOrders === 0 && (
        <OpTouch onPress={() => router.push("/products")}>
          <YStack
            backgroundColor={"$primary"}
            paddingHorizontal={"$sm"}
            paddingVertical={"$xs-sm"}
            borderRadius={"$full"}
          >
            <TextSMMedium color={"$white"}>{"Shop Now"}</TextSMMedium>
          </YStack>
        </OpTouch>
      )}
    </XStack>
  );
};
