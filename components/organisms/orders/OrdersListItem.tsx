import { useOrders } from "@/api/hooks/useOrders";
import { TextMDSemiBold } from "@/components/atoms";
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { CatalogUnavailableState } from "@/components/molecules/CatalogUnavailableState";
import OrderCard from "@/components/molecules/orders/OrderCard";
import { tokens } from "@/tamagui/token";
import { getCatalogUnavailableMessage } from "@/utils/catalogUnavailableError";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { getTokenValue, Spacer, YStack } from "tamagui";

const OrdersListItem = () => {
  const { data, isLoading, error, refetch, isRefetching } = useOrders();
  const unavailableMessage = getCatalogUnavailableMessage(error);

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

  if (unavailableMessage) {
    return (
      <CatalogUnavailableState
        error={error}
        minHeight={600}
        title="Orders unavailable"
        onRetry={refetch}
      />
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
                orderNumber: companyName,
                date: formatDate(item.placedAt || item.createdAt),
                status: orderStatus,
                itemCount: totalQuantity,
                shipping: item.shipping?.method || "Standard",
                totalPrice: item.totalPrice || 0,
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
        ItemSeparatorComponent={() => (
          <YStack paddingVertical={tokens.space.md}>
            <Divider />
          </YStack>
        )}
        contentContainerStyle={{
          paddingTop: 16,
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
