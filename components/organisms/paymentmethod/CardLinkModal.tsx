import { HeadingXSBold, ParagraphMD } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import React from "react";
import { getTokenValue, Spacer, YStack } from "tamagui";
import AlertModal from "../AlertModal";
type Props = {
  visible: boolean;
  expectedName: string; // user ka full name, e.g. "John Doe"
  onConfirm: () => void;
  onCancel: () => void;
  avatarUri?: string; // optional avatar
  loading?: boolean; // close button spinner state (agar aap add karna chahen)
};
const CardLinkModal = ({
  visible,
  expectedName,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <AlertModal visible={visible} onCancel={onCancel}>
      <YStack
        position="absolute"
        left={16}
        right={16}
        borderRadius={"$3xl"}
        top={"23%"}
        backgroundColor={"$white"}
        paddingHorizontal={"$md"}
        paddingVertical={"$md"}
      >
        <YStack alignItems="center" justifyContent="center">
          <AppImage name="debitCardFrame" width={276} height={184} />
        </YStack>
        <Spacer size={"$lg"} />
        <YStack alignItems="center">
          <HeadingXSBold textAlign="center">
            {"Debit Card Linked"}
          </HeadingXSBold>
          <Spacer size={"$reg"} />
          <YStack marginTop={8}>
            <ParagraphMD textAlign="center" color={"$secondary"}>
              {"You’re now ready to add funds to your swiftbank account."}
            </ParagraphMD>
          </YStack>
        </YStack>
        <Spacer size={"$lg"} />
        <PrimaryButton
          label="Link another card"
          isLoading={false}
          onPress={onConfirm}
          icon={
            <AppImage
              name="paymentcard"
              tintColor={getTokenValue("$white")}
              width={18}
              height={13}
            />
          }
          iconPosition="left"
        />
        <Spacer size={"$reg"} />
        <SecondaryButton onPress={onCancel} label="Maybe Later" />
      </YStack>
    </AlertModal>
  );
};

export default CardLinkModal;
