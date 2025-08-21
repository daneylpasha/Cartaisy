import Icons from "@/assets/Icons";
import { Spacer } from "@/components/atoms/Spacer";
import { GeneralCard } from "@/components/molecules/profile/GeneralCard";
import React from "react";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

export const DangerZoneListItem = () => {
  const DATA = [
    {
      id: 1,
      image: "trash" as keyof typeof Icons,
      title: "Close Account",
      subtitle: "Contact information and password",
      onPress: () => {},
    },
    {
      id: 2,
      image: "signout" as keyof typeof Icons,
      title: "Sign Out",

      onPress: () => {},
    },
  ];
  return (
    <YStack paddingHorizontal="$md">
      <FlatList
        data={DATA}
        renderItem={({ item }) => <GeneralCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
};
