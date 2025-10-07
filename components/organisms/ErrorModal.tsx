import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingXSBold, TextSMRegular } from "@/components/atoms/texts";
import { PrimaryButton } from "@/components/molecules/buttons";
import React from "react";
import { getTokenValue, YStack } from "tamagui";
import AlertModal from "./AlertModal";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
};

const ErrorModal = ({
  visible,
  title,
  message,
  onClose,
  buttonText = "OK",
}: Props) => {
  return (
    <AlertModal onCancel={onClose} visible={visible}>
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
        {/* Error Icon */}
        <YStack alignItems="center">
          <YStack
            backgroundColor="$lightred"
            borderRadius="$full"
            padding="$lg"
            width={80}
            height={80}
            justifyContent="center"
            alignItems="center"
          >
            <AppImage
              name="errorIcon"
              width={40}
              height={40}
              tintColor={getTokenValue("$red")}
            />
          </YStack>
          <Spacer size={"$lg"} />
          <HeadingXSBold textAlign="center">{title}</HeadingXSBold>
          <Spacer size={"$sm"} />
          <TextSMRegular color="$secondary" textAlign="center">
            {message}
          </TextSMRegular>
        </YStack>

        <Spacer size={"$xl"} />
        <PrimaryButton label={buttonText} isLoading={false} onPress={onClose} />
      </YStack>
    </AlertModal>
  );
};

export default ErrorModal;
