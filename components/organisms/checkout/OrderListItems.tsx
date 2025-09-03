import OrderCard from "@/components/molecules/OrderCard";
import React from "react";
import { FlatList } from "react-native-gesture-handler";
import { YStack } from "tamagui";

const OrderListItems = () => {
  const data = [
    {
      id: 1,
      title: "Cordless Vacuum Cleaner with HEPA Filter",
      image: "product4",
      currentPrice: 712.15,
      originalPrice: 815.21,
    },
    {
      id: 2,
      title: "Cordless Vacuum Cleaner with HEPA Filter",
      image: "product3",
      currentPrice: 712.22,
      originalPrice: 815.22,
    },
    {
      id: 3,
      title: "Cordless Vacuum Cleaner with HEPA Filter",
      image: "product5",
      currentPrice: 712.12,
      originalPrice: 815.22,
    },
  ];
  return (
    <YStack>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard item={item as any} />}
      />
    </YStack>
  );
};

export default OrderListItems;
