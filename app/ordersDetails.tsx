import { useCancelOrder, useOrderDetails } from "@/api/hooks/useOrders";
import {
  TextMDBold,
  TextMDSemiBold,
  TextSMMedium,
  TextSMRegular,
  TextSMSemiBold,
  TextXLBold,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import CancelOrderModal from "@/components/organisms/order-details/CancelOrderModal";
import { SHADOW_STYLES } from "@/constants/styles";
import { useLocalSearchParams } from "expo-router";

import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

const ordersDetails = () => {
  const { orderId } = useLocalSearchParams();

  // Fetch order details
  const { data, isLoading, error } = useOrderDetails(orderId as string);
  const order = data?.data?.order;

  const { mutate: cancelOrderMutation, isPending: isCancelling } =
    useCancelOrder();

  // Format currency helper
  const formatCurrency = (amount: number = 0, currency: string = "USD") => {
    const currencySymbol = currency === "USD" ? "$" : currency;
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  // Calculate total quantity from line items
  const totalQuantity =
    order?.lineItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
    order?.totalItems ||
    0;

  // Get display status with edge cases
  const getDisplayStatus = () => {
    if (!order) return { status: "In Progress", color: "$secondary" };

    const mobileStatus = order.mobileStatus?.current?.toLowerCase();
    const fulfillmentStatus = order.fulfillmentStatus?.toLowerCase();

    // Completed: Green badge
    if (mobileStatus === "delivered" || fulfillmentStatus === "fulfilled") {
      return { status: "Completed", color: "$green" };
    }
    // Cancelled: Red badge
    else if (
      mobileStatus === "cancelled" ||
      fulfillmentStatus === "cancelled"
    ) {
      return { status: "Cancelled", color: "$error" };
    }
    // In Progress: Default for placed/processing
    else if (mobileStatus === "placed" || mobileStatus === "processing") {
      return { status: "In Progress", color: "$secondary" };
    }
    // Default: In Progress
    else {
      return { status: "In Progress", color: "$secondary" };
    }
  };

  const displayStatus = getDisplayStatus();

  // Extract mobileStatus for CTAs visibility check
  const mobileStatus = order?.mobileStatus?.current?.toLowerCase();
  const fulfillmentStatus = order?.fulfillmentStatus?.toLowerCase();

  // Check if order can be cancelled (not already cancelled or delivered)
  const canShowCTAs = !(
    mobileStatus === "cancelled" ||
    mobileStatus === "delivered" ||
    fulfillmentStatus === "cancelled" ||
    fulfillmentStatus === "fulfilled"
  );

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  // Animation refs
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 10
        );
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 30) {
          // Swipe down - close
          setOpen(false);
        } else if (gestureState.dy < -30) {
          // Swipe up - open
          setOpen(true);
        }
      },
    })
  ).current;

  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();
  useEffect(() => {
    if (open) {
      // Animate in
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [open, animatedHeight, animatedOpacity]);

  // Handle open state change with animation delay
  const toggleOrderSummary = () => {
    if (open) {
      // Start closing animation
      setOpen(false);
    } else {
      // Open immediately
      setOpen(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
      >
        <Loader size="large" color="$primary" />
      </YStack>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
      >
        <TextMDSemiBold color="$error">
          Failed to load order details
        </TextMDSemiBold>
        <Spacer size="$sm" />
        <TextSMRegular color="$secondary">Please try again later</TextSMRegular>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={"$background"}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Spacer size={"$lg"} />
        <YStack justifyContent="center" alignItems="center">
          <YStack
            width={80}
            height={80}
            borderRadius={"$md"}
            borderWidth={1}
            borderColor={"$lightgrey"}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            {order.lineItems?.[0]?.image ? (
              <AppImage
                source={{ uri: order.lineItems[0].image }}
                width={80}
                height={80}
                resizeMode="cover"
              />
            ) : (
              <AppImage name="product1" size={80} />
            )}
          </YStack>
          <Spacer size={"$lg"} />
          <XStack
            justifyContent="center"
            alignItems="center"
            paddingHorizontal={"$reg"}
            paddingVertical={"$xs"}
            borderRadius={"$md"}
            backgroundColor={displayStatus.color}
          >
            <AppImage
              tintColor={getTokenValue("$white")}
              name="hourGlass"
              width={16}
              height={16}
            />
            <Spacer size={"$sm"} />
            <TextSMMedium color={"$white"}>{displayStatus.status}</TextSMMedium>
          </XStack>
          <Spacer size={"$lg"} />
          <XStack alignItems="center" justifyContent="center">
            <TextSMRegular> Qty: {totalQuantity}</TextSMRegular>
            <Spacer size={"$reg"} />
            <YStack
              width={4}
              height={4}
              backgroundColor={"$lightgrey"}
              borderRadius={"$full"}
            />
            <Spacer size={"$reg"} />
            <TextSMRegular>
              {" "}
              Order #{order.orderNumber?.slice(-6) || "N/A"}
            </TextSMRegular>
          </XStack>
          <Spacer size={"$reg"} />
          <TextXLBold
            textAlign="center"
            numberOfLines={2}
            paddingHorizontal="$md"
            color={"$secondary"}
          >
            {order.lineItems?.[0]?.title || "Order Item"}
          </TextXLBold>
          <Spacer size={"$reg"} />
          <TextSMRegular>
            Order{" "}
            {new Date(order.placedAt || order.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </TextSMRegular>
          <Spacer size={"$reg"} />
          <TextSMRegular>
            {order.shipping?.method || "Standard Shipping"}
          </TextSMRegular>
        </YStack>
        <Spacer size={"$xl"} />
        <YStack paddingHorizontal={"$md"}>
          {/* <TextMDBold>{"Timeline"}</TextMDBold> */}
          {/* <Spacer size={"$lg"} /> */}
          {/* <OrderTimeline /> */}
          <Spacer size={"$lg"} />
          <TextMDBold>{"Shipping Info"}</TextMDBold>
          <Spacer size={"$reg"} />
          <YStack>
            <YStack
              style={{
                ...SHADOW_STYLES,
              }}
              backgroundColor="$white"
              borderRadius="$md"
              padding="$reg"
            >
              <XStack>
                <XStack alignItems="center">
                  <YStack
                    backgroundColor={"$background"}
                    borderRadius={"$full"}
                    width={48}
                    height={48}
                    justifyContent="center"
                    alignItems="center"
                    marginTop={-10}
                  >
                    <AppImage name="deliveryBox" width={43} height={43} />
                  </YStack>
                  <Spacer size={"$reg"} />
                  <YStack>
                    <TextMDBold>
                      {order.shipping?.method || "Standard Shipping"}
                    </TextMDBold>
                    <Spacer size={"$xs"} />

                    <Spacer size={"$xs-sm"} />
                    <TextXSRegular color="$secondary">
                      Cost:{" "}
                      {formatCurrency(
                        order.shipping?.cost || order.shippingCost,
                        order.currency
                      )}
                    </TextXSRegular>
                  </YStack>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
          <Spacer size={"$md-lg"} />
          <SecondaryButton label="Track order" onPress={() => {}} />
          <Spacer size={"$xl"} />
          <TextMDBold>{"Address Info"}</TextMDBold>
          <Spacer size={"$reg"} />
          <XStack
            backgroundColor={"$white"}
            borderRadius="$md"
            padding={"$reg"}
            justifyContent="space-between"
          >
            <XStack>
              <AppImage
                name="locationUnfilled"
                tintColor={getTokenValue("$primary")}
                width={16}
                height={20}
              />
              <Spacer size={"$reg"} />
              <YStack width={"80%"}>
                <TextMDSemiBold>
                  {order.shippingAddress?.firstName}{" "}
                  {order.shippingAddress?.lastName}
                </TextMDSemiBold>
                <Spacer size={"$sm"} />
                <ParagraphSM color="$secondary">
                  {order.shippingAddress?.address1}
                  {order.shippingAddress?.address2 &&
                    `, ${order.shippingAddress?.address2}`}
                  {`, ${order.shippingAddress?.city}, ${order.shippingAddress?.province}, ${order.shippingAddress?.zip}`}
                </ParagraphSM>
                <Spacer size={"$sm"} />
                <XStack alignItems="center">
                  <YStack
                    justifyContent="center"
                    alignItems="center"
                    width={14}
                    height={14}
                    borderRadius="$full"
                    backgroundColor="$green"
                  >
                    <AppImage
                      name="check"
                      tintColor={getTokenValue("$white")}
                      width={7}
                      height={7}
                    />
                  </YStack>
                  <Spacer size={"$xs"} />
                  <TextXSRegular>{"Shipping Available"}</TextXSRegular>
                </XStack>
              </YStack>
            </XStack>
          </XStack>
        </YStack>
        <Spacer size={"$md"} />
      </ScrollView>

      <YStack paddingHorizontal={"$md"}>
        <Divider />
        <YStack>
          <Animated.View
            style={{
              opacity: animatedOpacity,

              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300], // Adjust this value based on your content height
              }),
              overflow: "hidden",
            }}
          >
            <Spacer size={"$sm"} />
            <Animated.View {...panResponder.panHandlers}>
              <YStack
                justifyContent="center"
                alignItems="center"
                width={40}
                height={20}
                alignSelf="center"
                paddingVertical={8}
              >
                <YStack
                  width={40}
                  height={4}
                  backgroundColor={"$icon"}
                  borderRadius={"$2xl"}
                />
              </YStack>
            </Animated.View>
            <Spacer size={"$sm"} />
            <TextMDBold>{"Payment Summary"}</TextMDBold>
            <Spacer size={"$reg"} />
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMSemiBold>Subtotal ({totalQuantity} Items)</TextSMSemiBold>
              <TextSMSemiBold>US${order.subtotalPrice}</TextSMSemiBold>
            </XStack>
            {order.discount > 0 && (
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMRegular color="$secondary">Discount</TextSMRegular>
                <TextSMSemiBold color="$green">
                  US$-{order.discount}
                </TextSMSemiBold>
              </XStack>
            )}
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMRegular color="$secondary">Taxes</TextSMRegular>
              <TextSMSemiBold>US${order.totalTax}</TextSMSemiBold>
            </XStack>
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMRegular color="$secondary">Delivery Fee</TextSMRegular>
              <TextSMSemiBold>US${order.shippingCost}</TextSMSemiBold>
            </XStack>
            <Spacer size={"$md"} />
          </Animated.View>

          <Divider />
          <Spacer size={"$sm"} />
          <OpTouch onPress={toggleOrderSummary}>
            <XStack justifyContent="space-between">
              <TextSMSemiBold>Grand Total</TextSMSemiBold>
              <XStack alignItems="center">
                <TextMDBold>US${order.totalPrice}</TextMDBold>
                <Spacer size={"$xs"} />
                <AppImage
                  name="caretRight"
                  width={14}
                  height={14}
                  style={{
                    transform: [
                      {
                        rotate: open ? "-90deg" : "90deg",
                      },
                    ],
                  }}
                />
              </XStack>
            </XStack>
          </OpTouch>
          <Spacer size={"$md"} />
        </YStack>
        {canShowCTAs && (
          <>
            <PrimaryButton
              label={"I need help with this order"}
              onPress={() => {}}
              isLoading={false}
            />
            <Spacer size={"$reg"} />
            <SecondaryButton
              onPress={() => setShow(true)}
              label={"Cancel Order"}
            />
          </>
        )}
        <Spacer size={bottomSafeAreaInset} />
      </YStack>

      <CancelOrderModal
        visible={show}
        loading={isCancelling}
        onConfirm={(reason) => {
          cancelOrderMutation(
            { orderId: orderId as string, reason },
            {
              onSuccess: () => {
                setShow(false);
                // Order details will auto-refresh due to query invalidation
              },
              onError: (error) => {
                console.error("[Cancel Order] Error:", error);
                setShow(false);
              },
            }
          );
        }}
        onCancel={() => setShow(false)}
      />
    </YStack>
  );
};

export default ordersDetails;
