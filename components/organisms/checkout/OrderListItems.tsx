import { CheckoutSummaryResponseDataItemsItem } from "@/api/generated/cartaisyAPI.schemas";
import OrderCard from "@/components/molecules/OrderCard";
import React from "react";
import { FlatList } from "react-native-gesture-handler";
import { YStack } from "tamagui";

interface OrderListItemsProps {
  items?: CheckoutSummaryResponseDataItemsItem[];
}

const OrderListItems = ({ items = [] }: OrderListItemsProps) => {
  return (
    <YStack>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard item={item as any} />}
      />
    </YStack>
  );
};

export default OrderListItems;
