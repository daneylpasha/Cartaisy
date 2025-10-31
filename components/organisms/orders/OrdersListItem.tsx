import { useOrders } from "@/api/hooks/useOrders";
import { TextMDSemiBold } from "@/components/atoms";
import { Loader } from "@/components/atoms/Loader";
import OrderCard from "@/components/molecules/orders/OrderCard";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { getTokenValue, Spacer, YStack } from "tamagui";

const OrdersListItem = () => {
  const { data, isLoading, error, refetch, isRefetching } = useOrders();

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        minHeight={600}
      >
        <Loader size="large" color="$primary" />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        minHeight={600}
      >
        <TextMDSemiBold color="$error">Failed to load orders</TextMDSemiBold>
        <Spacer size="$sm" />
        <TextMDSemiBold color="$primary" onPress={() => refetch()}>
          Tap to retry
        </TextMDSemiBold>
      </YStack>
    );
  }

  // Safely access nested data
  const orders = data?.data?.orders || [];

  if (orders.length === 0) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        minHeight={600}
      >
        <TextMDSemiBold color="$secondary">No orders found</TextMDSemiBold>
      </YStack>
    );
  }

  return (
    <YStack>
      <FlatList
        data={orders}
        renderItem={({ item }) => {
          // Map backend status to display status (3 states as per spec)
          const getDisplayStatus = () => {
            const mobileStatus = item.mobileStatus?.current?.toLowerCase();
            const fulfillmentStatus = item.fulfillmentStatus?.toLowerCase();

            // Completed: Green badge
            if (
              mobileStatus === "delivered" ||
              fulfillmentStatus === "fulfilled"
            ) {
              return "Completed";
            }
            // Cancelled: Grey badge
            else if (
              mobileStatus === "cancelled" ||
              fulfillmentStatus === "cancelled"
            ) {
              return "Cancelled";
            }
            // In Progress: Default for placed/processing (yellow/orange badge)
            else if (
              mobileStatus === "placed" ||
              mobileStatus === "processing"
            ) {
              return "In Progress";
            }
            // Pending: Red badge for other states
            else {
              return "Pending";
            }
          };

          // Format date
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          };

          // Slice order ID to show last 6 characters
          const shortOrderId =
            item.orderNumber?.slice(-6) ||
            item.id?.toString().slice(-6) ||
            "000000";

          // Get first line item
          const firstItem = item.lineItems?.[0];

          const productImage = firstItem?.image;

          // Calculate total quantity from all line items
          const totalQuantity =
            item.lineItems?.reduce(
              (sum: number, lineItem: any) => sum + (lineItem.quantity || 0),
              0
            ) ||
            item.totalItems ||
            0;

          // Company/Carrier name - default to Order # (carrier field not in API)
          const companyName = `Order #${shortOrderId}`;

          const orderStatus = getDisplayStatus();

          return (
            <OrderCard
              item={{
                id: item._id || item.id,
                title: firstItem?.title || "Order Item",
                image: productImage,
                currentPrice: item.totalPrice || 0,
                total: item.totalPrice || 0,
                quantity: totalQuantity,
                qty: totalQuantity,
                variantTitle: `Order #${shortOrderId}`,
                companyName: companyName,
                date: formatDate(item.placedAt || item.createdAt),
                progress: orderStatus,
                shipping: item.shipping?.method || "Standard",
                onPress: () => {
                  router.push({
                    pathname: "/ordersDetails",
                    params: { orderId: item._id || item.id },
                  });
                },
              }}
            />
          );
        }}
        keyExtractor={(item) => item._id || item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Spacer size={tokens.space.md} />}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={getTokenValue("$primary")}
            colors={[getTokenValue("$primary")]}
          />
        }
      />
    </YStack>
  );
};

export default OrdersListItem;
