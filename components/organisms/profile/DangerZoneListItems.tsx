import Icons from "@/assets/Icons";
import { Spacer } from "@/components/atoms/Spacer";
import { GeneralCard } from "@/components/molecules/profile/GeneralCard";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";

import { YStack } from "tamagui";
import CloseAccountModal from "../CloseAccountModal";

export const DangerZoneListItem = () => {
  const [show, setShow] = useState(false);
  const DATA = [
    {
      id: 1,
      image: "trash" as keyof typeof Icons,
      title: "Close Account",
      subtitle: "Contact information and password",
      onPress: () => {
        setShow(true);
      },
    },
    {
      id: 2,
      image: "signout" as keyof typeof Icons,
      title: "Sign Out",
      onPress: () => {
        router.push("/(auth)/login");
      },
    },
  ];
  return (
    <YStack paddingHorizontal="$md">
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <GeneralCard {...item} onPress={item.onPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
        showsVerticalScrollIndicator={false}
      />
      <CloseAccountModal
        visible={show}
        expectedName="John Doe"
        onConfirm={() => {
          router.push("/login");
          setShow(false);
        }}
        onCancel={() => setShow(false)}
      />
    </YStack>
  );
};
