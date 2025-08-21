import { TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { router } from "expo-router";
import { getTokenValue, XStack, YStack } from "tamagui";

export const ActiveOrders = ({
  activeOrders,
}: //   showOrder = true,
{
  activeOrders: number;
  //   showOrder?: boolean;
}) => {
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
          tintColor={getTokenValue("$primary")}
          width={21}
          height={19}
        />
      </YStack>
      <Spacer size="$reg" />
      <YStack flex={1}>
        <TextMDBold>{`You have ${activeOrders} active order`}</TextMDBold>
        <Spacer size="$xs" />
        <TextSMRegular color={"$secondary"}>
          {"Items are on the ways."}
        </TextSMRegular>
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
