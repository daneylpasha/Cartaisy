import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingXSBold, TextSMRegular } from "@/components/atoms/texts";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import React from "react";
import { getTokenValue, YStack } from "tamagui";
import AlertModal from "./AlertModal";

type Props = {
  visible: boolean;
  itemCount: number;
  onViewCart: () => void;
  onContinueShopping: () => void;
};

const AddToCartSuccessModal = ({
  visible,
  itemCount,
  onViewCart,
  onContinueShopping,
}: Props) => {
  return (
    <AlertModal onCancel={onContinueShopping} visible={visible}>
      <YStack
        position="absolute"
        left={16}
        right={16}
        borderRadius={"$3xl"}
        top={"30%"}
        backgroundColor={"$white"}
        paddingHorizontal={"$md"}
        paddingVertical={"$xl"}
      >
        {/* Success Icon */}
        <YStack alignItems="center">
          <YStack
            backgroundColor="$lightgreen"
            borderRadius="$full"
            padding="$lg"
            width={80}
            height={80}
            justifyContent="center"
            alignItems="center"
          >
            <AppImage
              name="check"
              width={40}
              height={40}
              tintColor={getTokenValue("$green")}
            />
          </YStack>
          <Spacer size={"$lg"} />
          <HeadingXSBold textAlign="center">Added to Cart!</HeadingXSBold>
          <Spacer size={"$sm"} />
          <TextSMRegular color="$secondary" textAlign="center">
            {itemCount} {itemCount === 1 ? "item" : "items"} added to your cart
            successfully
          </TextSMRegular>
        </YStack>

        <Spacer size={"$xl"} />
        <PrimaryButton
          label="View Cart"
          isLoading={false}
          onPress={onViewCart}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          label="Continue Shopping"
          isLoading={false}
          onPress={onContinueShopping}
        />
      </YStack>
    </AlertModal>
  );
};

export default AddToCartSuccessModal;
