import Icons from "@/assets/Icons";
import { GeneralCard } from "@/components/molecules/profile/GeneralCard";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

export const PaymentListItem = () => {
  const DATA = [
    {
      id: 1,
      image: "wallet" as keyof typeof Icons,
      title: "Payment Method",
      subtitle: "Contact information and payment methods",
      route: "/paymentMethod",

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
            onPress={() =>
              router.push({
                pathname: item.route as any,
              })
            }
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
};
