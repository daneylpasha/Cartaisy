import Icons from "@/assets/Icons";
import { Spacer } from "@/components/atoms/Spacer";
import { GeneralCard } from "@/components/molecules/profile/GeneralCard";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

export const SecurityListItem = () => {
  const DATA = [
    // {
    //   id: 1,
    //   image: "security" as keyof typeof Icons,
    //   title: "Login & Security",
    //   subtitle: "Change your password",
    //   route: "securitySettings",
    //   onPress: () => {},
    // },
    {
      id: 2,
      image: "passwordChange" as keyof typeof Icons,
      title: "Change Password",
      route: "changePassword",
      onPress: () => {},
    },
  ];
  return (
    <YStack paddingHorizontal="$md">
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <GeneralCard
            {...item}
            onPress={() => {
              router.push({
                pathname: item.route as any,
              });
            }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
};
