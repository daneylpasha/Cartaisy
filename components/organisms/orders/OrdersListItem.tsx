import { useOrders } from "@/api/hooks/useOrders";
import { Divider } from "@/components/atoms/Divider";
import { CatalogUnavailableState } from "@/components/molecules/CatalogUnavailableState";
import OrderCard from "@/components/molecules/orders/OrderCard";
import { ShopperSkeleton } from "@/components/molecules/ShopperSkeleton";
import { ShopperState } from "@/components/molecules/ShopperState";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { tokens } from "@/tamagui/token";
import { getCatalogUnavailableMessage } from "@/utils/catalogUnavailableError";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { YStack } from "tamagui";

const OrdersListItem = () => {
  const getReactiveColor = useReactiveTokenColor();
  const refreshTint = getReactiveColor("primary");
  const { data, isLoading, error, refetch, isRefetching } = useOrders();
  const unavailableMessage = getCatalogUnavailableMessage(error);

  if (isLoading) {
    return (
      <YStack minHeight={600}>
        <ShopperSkeleton variant="results" />
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
      <ShopperState
        icon="warningIcon"
        title="Orders unavailable"
        message="We couldn't load your orders. Check your connection and try again."
        actionLabel="Try again"
        onAction={() => refetch()}
        minHeight={600}
      />
    );
  }

  // Safely access nested data
  const orders = data?.data?.orders || [];

  if (orders.length === 0) {
    return (
      <ShopperState
        icon="package"
        title="No orders yet"
        message="When you place an order, it will show up here."
        actionLabel="Start shopping"
        onAction={() => router.push("/(tabs)")}
        minHeight={600}
      />
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
            tintColor={refreshTint}
            colors={refreshTint ? [refreshTint] : undefined}
          />
        }
      />
    </YStack>
  );
};

export default OrdersListItem;
