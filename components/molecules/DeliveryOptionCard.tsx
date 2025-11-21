import Icons from "@/assets/Icons";
import React from "react";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";
import { TextMDBold, TextXSRegular } from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { OpTouch } from "../atoms/OpTouch";

type DeliveryOptionItemProps = {
  id?: number;
  title: string;
  estimateddays: string;
  image: keyof typeof Icons;
  cost: string;
};

type DeliveryOptionProps = {
  item: DeliveryOptionItemProps;
  setSelectedDelivery: (id: number) => void;
  selectedDelivery?: number;
};
const DeliveryOptionCard = ({
  item,
  selectedDelivery,
  setSelectedDelivery,
}: DeliveryOptionProps) => {
  return (
    <OpTouch
      onPress={() => {
        setSelectedDelivery(item.id!);
      }}
    >
      <YStack paddingHorizontal={"$md"}>
        <YStack
          backgroundColor={
            selectedDelivery === item.id ? "$primarylight" : "$background"
          }
          borderWidth={1}
          borderColor={selectedDelivery === item.id ? "$primary" : "$white"}
          borderRadius="$md"
          padding="$reg"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center">
              <YStack
                backgroundColor={selectedDelivery === item.id ? "" : "$white"}
                borderRadius={"$full"}
                width={48}
                height={48}
                justifyContent="center"
                alignItems="center"
                marginTop={-10}
                overflow="hidden"
              >
                <AppImage name={item.image} width={43} height={43} />
              </YStack>
              <Spacer size={"$reg"} />
              <YStack>
                <TextMDBold>{item.title}</TextMDBold>

                <Spacer size={"$xs-sm"} />
                <TextXSRegular color="$secondary">{item.cost}</TextXSRegular>
              </YStack>
            </XStack>
            <YStack
              width={20}
              height={20}
              borderRadius={"$full"}
              justifyContent="center"
              alignItems="center"
              backgroundColor={
                selectedDelivery === item.id ? "$primary" : "$background"
              }
            >
              {selectedDelivery === item.id && (
                <AppImage
                  name="check"
                  tintColor={getTokenValue("$white")}
                  size={10}
                />
              )}
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </OpTouch>
  );
};

export default DeliveryOptionCard;
