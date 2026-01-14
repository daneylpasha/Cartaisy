import { ActiveCard } from "@/components/molecules/profile/ActiveCard";
import { Order } from "@/api/hooks/useOrders";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";

type ActiveListItemProps = {
  orders?: Order[];
};

export const ActiveListItem = ({ orders = [] }: ActiveListItemProps) => {
  // Filter out fulfilled and cancelled orders
  const activeOrders = orders.filter(
    (order) =>
      order.fulfillmentStatus?.toLowerCase() !== "fulfilled" &&
      order.fulfillmentStatus?.toLowerCase() !== "cancelled"
  );

  // If no orders, show empty state
  if (activeOrders.length === 0) {
    return null;
  }

  return (
    <YStack>
      <FlatList
        data={activeOrders}
        renderItem={({ item: order }) => (
          <ActiveCard
            order={order}
            onPress={() => {
              router.push(`/ordersDetails?orderId=${order._id}`);
            }}
          />
        )}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Spacer size={tokens.space.md} />}
        contentContainerStyle={
          {
            // gap: tokens.space.md,
          }
        }
        scrollEnabled={true}
      />
    </YStack>
  );
};
