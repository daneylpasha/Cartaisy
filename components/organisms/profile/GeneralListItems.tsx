import Icons from "@/assets/Icons";
import { GeneralCard } from "@/components/molecules/profile/GeneralCard";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";

export const GeneralListItems = () => {
  const DATA = [
    {
      id: 1,
      image: "userIcon" as keyof typeof Icons,
      title: "Personal Info",
      subtitle: "Edit your personal info",
      route: "/personalInfo",
    },
    {
      id: 2,
      image: "locationUnfilled" as keyof typeof Icons,
      title: "Address",
      route: "/addAddress",
    },

    {
      id: 3,
      image: "notification" as keyof typeof Icons,
      title: "Notifications",
      route: "/notificationSettings",
    },
  ];
  return (
    <YStack paddingHorizontal="$md">
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <GeneralCard
            {...item}
            onPress={() =>
              router.push({
                pathname: item.route as any,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <Spacer size={tokens.space.sm} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
};
