import Icons from "@/assets/Icons";
import OrderCard from "@/components/molecules/orders/OrderCard";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacer, YStack } from "tamagui";
const OrdersListItem = () => {
  const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const activeOrders = [
    {
      id: 1,
      image: "product1" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 1,
      shipping: "Regular Shipping",
      total: 405.5,
      progress: "In Progress",
      companyName: "Zeero Corp Gadget",
      date: "Nov 23, 2025",
    },
    {
      id: 2,
      image: "product2" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 2,
      shipping: "Regular Shipping",
      total: 405.5,
      progress: "Completed",
      companyName: "Bigsby Fashion",
      date: "Nov 23, 2025",
    },
    {
      id: 3,
      image: "product3" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 1,
      shipping: "Regular Shipping",
      total: 405.5,
      progress: "Pending",
      companyName: "Blocks Accesories",
      date: "Nov 23, 2025",
    },
    {
      id: 4,
      image: "product3" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 4,
      shipping: "Regular Shipping",
      total: 405.5,
      progress: "In Progress",
      companyName: "Zeero Corp Gadget",
      date: "Nov 23, 2025",
    },
  ];
  return (
    <YStack>
      <FlatList
        data={activeOrders}
        renderItem={({ item }) => <OrderCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Spacer size={tokens.space.md} />}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    </YStack>
  );
};

export default OrdersListItem;
