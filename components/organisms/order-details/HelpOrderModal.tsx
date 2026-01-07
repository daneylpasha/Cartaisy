import { AppImage } from "@/components/atoms/AppImage";
import React, { useState } from "react";
import { getTokenValue, XStack, YStack } from "tamagui";

import Icons from "@/assets/Icons";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import { tokens } from "@/tamagui/token";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import {
  HeadingXSBold,
  ParagraphMD,
  TextMDSemiBold,
  TextSMSemiBold,
} from "../../atoms";
import { Spacer } from "../../atoms/Spacer";
import AlertModal from "../AlertModal";

type Props = {
  visible: boolean;
  onConfirm: (reason: string, otherText?: string) => void;
  onCancel: () => void;
  loading?: boolean;
};

type HelpReason =
  | "item_damaged"
  | "wrong_item"
  | "order_not_received"
  | "missing_items"
  | "tracking_info"
  | "other";

type HelpOption = {
  id: number;
  title: string;
  reason: HelpReason;
  image: keyof typeof Icons;
};

const HELP_OPTIONS: HelpOption[] = [
  {
    id: 1,
    image: "warningAlert" as keyof typeof Icons,
    title: "Item damaged or defective",
    reason: "item_damaged",
  },
  {
    id: 2,
    image: "package" as keyof typeof Icons,
    title: "Wrong item received",
    reason: "wrong_item",
  },
  {
    id: 3,
    image: "truck" as keyof typeof Icons,
    title: "Order not received",
    reason: "order_not_received",
  },
  {
    id: 4,
    image: "list" as keyof typeof Icons,
    title: "Missing items in order",
    reason: "missing_items",
  },
  {
    id: 5,
    image: "locationIconUnfilled" as keyof typeof Icons,
    title: "Need tracking information",
    reason: "tracking_info",
  },
  {
    id: 6,
    image: "noteIcon" as keyof typeof Icons,
    title: "Other",
    reason: "other",
  },
];

export default function HelpOrderModal({
  visible,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const [selected, setSelected] = useState<number>(0);
  const [otherText, setOtherText] = useState<string>("");

  const isOtherSelected = selected === 6;
  const canSubmit =
    selected > 0 && (!isOtherSelected || otherText.trim().length > 0);

  const handleConfirm = () => {
    const selectedOption = HELP_OPTIONS.find((item) => item.id === selected);
    if (selectedOption) {
      onConfirm(selectedOption.reason, isOtherSelected ? otherText.trim() : undefined);
    }
  };

  const handleCancel = () => {
    setSelected(0);
    setOtherText("");
    onCancel();
  };

  const renderItem = ({ item }: { item: HelpOption }) => {
    const isSelected = selected === item.id;
    return (
      <XStack
        backgroundColor={isSelected ? "$primarylight" : "$background"}
        borderRadius={"$md"}
        borderColor={isSelected ? "$primary" : "$white"}
        borderWidth={"$xxxs"}
        justifyContent="space-between"
        alignItems="center"
        padding={"$reg"}
        onPress={() => setSelected(item.id)}
      >
        <XStack alignItems="center" flex={1}>
          <AppImage
            name={item.image}
            tintColor={getTokenValue("$secondary")}
            width={20}
            height={15}
          />
          <Spacer size={"$reg"} />
          <TextMDSemiBold>{item.title}</TextMDSemiBold>
        </XStack>
        <YStack
          width={"$lg"}
          height={"$lg"}
          borderRadius="$full"
          borderWidth={"$xxxs"}
          position="relative"
          borderColor={isSelected ? "$primary" : "$icon"}
        >
          <YStack
            width={"$sm-reg"}
            height={"$sm-reg"}
            borderRadius="$full"
            backgroundColor={isSelected ? "$primary" : "$background"}
            position="absolute"
            justifyContent="center"
            alignItems="center"
            top={6}
            left={6}
            right={0}
            bottom={0}
          />
        </YStack>
      </XStack>
    );
  };

  return (
    <AlertModal visible={visible} onCancel={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: Platform.OS === "ios" ? "10%" : "10%",
          maxHeight: "80%",
        }}
      >
        <YStack
          borderRadius={"$md"}
          backgroundColor={"$white"}
          paddingHorizontal={"$md"}
          paddingVertical={"$reg"}
          maxHeight="100%"
        >
          <YStack alignItems="center">
            <YStack
              backgroundColor={"$primarylight"}
              justifyContent="center"
              alignItems="center"
              width={48}
              height={48}
              borderRadius={"$full"}
            >
              <AppImage
                name="recommend"
                width={24}
                height={24}
                tintColor={getTokenValue("$primary")}
              />
            </YStack>
            <Spacer size={"$lg"} />
            <HeadingXSBold textAlign="center">
              {"Need help with this order?"}
            </HeadingXSBold>
            <Spacer size={"$reg"} />
            <YStack>
              <ParagraphMD color={"$secondary"} textAlign="center">
                {"Please select the issue you're experiencing"}
              </ParagraphMD>
            </YStack>
          </YStack>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Spacer size={"$lg"} />
            {HELP_OPTIONS.map((item, index) => (
              <YStack key={item.id}>
                {renderItem({ item })}
                {index < HELP_OPTIONS.length - 1 && <Spacer size={"$reg"} />}
              </YStack>
            ))}

            {/* Other text input - shown when "Other" is selected */}
            {isOtherSelected && (
              <>
                <Spacer size={"$reg"} />
                <TextSMSemiBold>Please describe your issue</TextSMSemiBold>
                <Spacer size={"$sm"} />
                <YStack
                  borderWidth={1}
                  borderColor="$lightgrey"
                  borderRadius="$md"
                  backgroundColor="$background"
                  padding="$sm"
                >
                  <TextInput
                    value={otherText}
                    onChangeText={setOtherText}
                    placeholder="Enter your issue here..."
                    placeholderTextColor={tokens.color.textgrey}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={{
                      minHeight: 70,
                      fontSize: 14,
                      fontFamily: "Figtree-Regular",
                      color: tokens.color.darkgrey,
                    }}
                  />
                </YStack>
              </>
            )}

            <Spacer size={"$lg"} />
            <YStack opacity={canSubmit ? 1 : 0.5}>
              <PrimaryButton
                label="Submit"
                isLoading={loading}
                disabled={!canSubmit}
                onPress={handleConfirm}
              />
            </YStack>
            <Spacer size={"$reg"} />
            <SecondaryButton onPress={handleCancel} label="Cancel" />
            <Spacer size={"$reg"} />
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </AlertModal>
  );
}
