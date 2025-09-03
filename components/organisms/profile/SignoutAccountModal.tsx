import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import React from "react";
import { Spacer, YStack } from "tamagui";
import { HeadingXSBold } from "../../atoms/texts";
import AlertModal from "../AlertModal";
type Props = {
  visible: boolean;
  expectedName: string; // user ka full name, e.g. "John Doe"
  onConfirm: () => void;
  onCancel: () => void;
  avatarUri?: string; // optional avatar
  loading?: boolean; // close button spinner state (agar aap add karna chahen)
};
const SignoutAccountModal = ({
  visible,
  expectedName,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <AlertModal onCancel={onCancel} visible={visible}>
      <YStack
        position="absolute"
        left={16}
        right={16}
        borderRadius={"$3xl"}
        top={"30%"}
        backgroundColor={"$white"}
        paddingHorizontal={"$md"}
        paddingVertical={"$reg"}
      >
        {/* Title + subtitle */}
        <YStack alignItems="center">
          <HeadingXSBold textAlign="center">
            Are you sure to sign out{"\n"}your account?
          </HeadingXSBold>
          <Spacer size={"$reg"} />
          <YStack marginTop={8}></YStack>
        </YStack>

        <Spacer size={"$lg"} />
        <PrimaryButton
          label="Yes , Sure"
          isLoading={false}
          background={"red"}
          onPress={onConfirm}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          color="red"
          borderColor="red"
          onPress={onCancel}
          label="No"
        />
      </YStack>
    </AlertModal>
  );
};

export default SignoutAccountModal;
