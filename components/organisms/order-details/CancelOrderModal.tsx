import { AppImage } from "@/components/atoms/AppImage";
import React, { useState } from "react";
import { getTokenValue, XStack, YStack } from "tamagui";

import Icons from "@/assets/Icons";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import { FlatList } from "react-native";
import { HeadingXSBold, ParagraphMD, TextMDSemiBold } from "../../atoms";
import { Spacer } from "../../atoms/Spacer";
import AlertModal from "../AlertModal";
type Props = {
  visible: boolean;
  expectedName: string; // user ka full name, e.g. "John Doe"
  onConfirm: () => void;
  onCancel: () => void;
  avatarUri?: string; // optional avatar
  loading?: boolean; // close button spinner state (agar aap add karna chahen)
};
type PasswordForm = {
  password: string;
};
type CancelData = {
  item: {
    id: number;
    title: string;
    image: keyof typeof Icons;
  };
};

export default function CancelOrderModal({
  visible,
  onConfirm,
  onCancel,
}: Props) {
  const [selected, setSelected] = useState<number>(0);

  const CancelData = [
    {
      id: 1,
      image: "closeIcon" as keyof typeof Icons,
      title: "Order was a mistake",
    },
    {
      id: 2,
      image: "truck" as keyof typeof Icons,
      title: "Delivery is too high",
    },
    {
      id: 3,
      image: "moneyIcon" as keyof typeof Icons,
      title: "Item price is too high",
    },
    {
      id: 4,
      image: "trendingIconDown" as keyof typeof Icons,
      title: "Item price is too high",
    },
    {
      id: 5,
      image: "locationIconUnfilled" as keyof typeof Icons,
      title: "Item price is too high",
    },
  ];

  const renderItem = ({ item }: CancelData) => {
    return (
      <XStack
        backgroundColor={selected === item.id ? "$primarylight" : "$background"}
        borderRadius={"$2xl"}
        borderColor={selected === item.id ? "$primary" : "$white"}
        borderWidth={"$xxxs"}
        justifyContent="space-between"
        alignItems="center"
        padding={"$reg"}
        onPress={() => setSelected(item.id)}
      >
        <XStack alignItems="center">
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
          borderColor={selected === item.id ? "$primary" : "$icon"}
        >
          <YStack
            width={"$sm-reg"}
            height={"$sm-reg"}
            borderRadius="$full"
            backgroundColor={selected === item.id ? "$primary" : "$background"}
            position="absolute"
            justifyContent="center"
            alignItems="center"
            top={6}
            left={6}
            right={0}
            bottom={0}
          ></YStack>
        </YStack>
      </XStack>
    );
  };
  return (
    <AlertModal visible={visible} onCancel={onCancel}>
      <YStack
        position="absolute"
        left={16}
        right={16}
        borderRadius={"$3xl"}
        top={"20%"}
        backgroundColor={"$white"}
        paddingHorizontal={"$md"}
        paddingVertical={"$reg"}
      >
        <YStack alignItems="center">
          <YStack
            backgroundColor={"$errorbg"}
            justifyContent="center"
            alignItems="center"
            width={48}
            height={48}
            borderRadius={"$full"}
          >
            <AppImage name="warningAlert" width={20} height={20} />
          </YStack>
          <Spacer size={"$lg"} />
          <HeadingXSBold textAlign="center">
            {"Cancel this order?"}
          </HeadingXSBold>
          <Spacer size={"$reg"} />
          <YStack>
            <ParagraphMD color={"$secondary"}>
              {"Why would you like to cancel this order?"}
            </ParagraphMD>
          </YStack>
        </YStack>
        <Spacer size={"$lg"} />
        <FlatList
          data={CancelData}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={(item) => renderItem(item)}
          ItemSeparatorComponent={() => <Spacer size={"$reg"} />}
        />
        <Spacer size={"$lg"} />
        <PrimaryButton
          label="Cancel this order"
          isLoading={false}
          background={"red"}
          onPress={onConfirm}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          color="red"
          borderColor="red"
          onPress={onCancel}
          label="Nevermind"
        />
      </YStack>
    </AlertModal>
  );
}
