import { HeadingSMBold, ParagraphMD, TextSMRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import { router } from "expo-router";
import React from "react";
import { XStack, YStack } from "tamagui";

const CancelOrder = () => {
  const imageData = ["product1", "productForyou2", "productForyou1"];
  return (
    <ScreenContainer backgroundColor={"background"}>
      <YStack paddingHorizontal={"$md"} alignItems="center" justifyContent="center">
        <Spacer size={"$5xl"} />
        <AppImage name="cancelOrderFrame" width={343} height={203} />
        <Spacer size={"$xl"} />
        <HeadingSMBold>{"Order Cancelled"}</HeadingSMBold>
        <Spacer size={"$reg"} />
        <ParagraphMD color="$secondary">
          {"Your order has been succesfully cancelled."}
        </ParagraphMD>
        <Spacer size={"$xl"} />
        <XStack gap="$sm" alignItems="center">
          {imageData.map((item, index) => (
            <YStack
              key={index}
              borderRadius="$md"
              overflow="hidden"
              borderWidth={1}
              borderColor={"$lightgrey"}
              backgroundColor="$background"
              padding="$xs"
            >
              <AppImage name={item as any} width={56} height={56} />
            </YStack>
          ))}
        </XStack>
        <Spacer size={"$md"} />
        <XStack alignItems="center">
          <TextSMRegular color="$secondary">
            {"Order #1157lg5748411"}
          </TextSMRegular>
          <Spacer size={"$sm"} />
          <YStack
            width={4}
            height={4}
            borderRadius="$full"
            backgroundColor="$lightgrey"
          />
          <Spacer size={"$sm"} />

          <TextSMRegular color="$secondary">{"$13.25"}</TextSMRegular>
        </XStack>
        <Spacer size={"$xl"} />
        <PrimaryButton
          label={"See Order Status"}
          onPress={() => {router.push('/orders')}}
          isLoading={false}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton onPress={() => {
            router.push('/(tabs)')
        }} label={"Continue Shopping"} />
      </YStack>
    </ScreenContainer>
  );
};

export default CancelOrder;
