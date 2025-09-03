import { Spacer } from "@/components/atoms/Spacer";
import OrdersListItem from "@/components/organisms/orders/OrdersListItem";
import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { YStack } from "tamagui";
const orders = () => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  return (
    <YStack backgroundColor={"$background"} flex={1}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: bottomSafeAreaInset,
        }}
      >
        <Spacer size="$reg" />
        <OrdersListItem />
        <Spacer size={"$xl"} />
      </ScrollView>
    </YStack>
  );
};

export default orders;
