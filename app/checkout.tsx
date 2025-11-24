import { useClearCart } from "@/api/generated/cart/cart";
import { useCompleteCheckout } from "@/api/generated/checkout/checkout";
import { TextMDBold, TextSMRegular, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { CheckoutStepper } from "@/components/molecules/checkout/CheckoutStepper";
import Confirmation from "@/components/molecules/checkout/Confirmation";
import PaymentStepper from "@/components/molecules/checkout/Payment";
import Shipping from "@/components/molecules/checkout/Shipping";
import useCartStore from "@/store/useCartStore";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getTokenValue, XStack, YStack } from "tamagui";

type CheckoutStep = "shipping" | "payment" | "confirmation" | "succesfull";

const CheckoutScreen = () => {
  const params = useLocalSearchParams();
  const initialSessionId = params.sessionId as string;
  const queryClient = useQueryClient();

  // Cart store and clear mutation
  const { cartId, clearCart: clearCartStore } = useCartStore();
  const { mutate: clearCartAPI } = useClearCart();

  const [sessionId, setSessionId] = useState<string>(initialSessionId || "");
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const shippingRef = useRef<any>(null);
  const paymentRef = useRef<any>(null);

  // Animation refs
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
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

  // Pan responder for swipe gesture
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

  // Complete checkout mutation
  const { mutate: completeCheckout } = useCompleteCheckout({
    mutation: {
      onSuccess: (response) => {
        console.log("[Checkout] ✅ Order created successfully!");
        console.log("[Checkout] Response:", response);

        // Response structure: { success: true, data: { order: {...} }, message: "..." }
        const orderData = (response.data as any)?.order;

        if (response.success && orderData) {
          console.log("[Checkout] Order data found, preparing navigation...");

          // Transform API response to match CompleteOrderDetails interface
          const transformedOrderDetails = {
            orderNumber: orderData.orderNumber || "N/A",
            email:
              orderData.email || checkoutSummary?.shippingAddress?.email || "",
            phone:
              orderData.phone || checkoutSummary?.shippingAddress?.phone || "",
            shippingAddress:
              orderData.shippingAddress ||
              checkoutSummary?.shippingAddress ||
              {},
            payment: {
              cardBrand: orderData.payment?.method || "card",
              last4:
                orderData.payment?.last4 ||
                checkoutSummary?.paymentMethod?.last4 ||
                "****",
            },
            shipping: {
              method:
                orderData.shipping?.method ||
                checkoutSummary?.shippingMethod?.title ||
                "Standard",
            },
            dates: {
              estimatedDelivery:
                orderData.dates?.estimatedDelivery ||
                checkoutSummary?.shippingMethod?.estimatedDelivery ||
                null,
            },
            pricing: {
              totalPrice:
                orderData.pricing?.totalPrice ||
                checkoutSummary?.pricing?.grandTotal ||
                0,
              currency:
                orderData.pricing?.currency ||
                checkoutSummary?.pricing?.currency ||
                "USD",
            },
            discount: {
              amount:
                orderData.discount?.amount ||
                (checkoutSummary?.pricing?.discountAmount || 0) +
                  (checkoutSummary?.pricing?.couponDiscount || 0),
            },
            products: orderData.products || checkoutSummary?.items || [],
          };

          setIsProcessing(false);

          // Clear cart from local store
          clearCartStore();

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          console.log("[Checkout] ✅ Orders cache invalidated");

          router.replace("/(tabs)");

          setTimeout(() => {
            router.push({
              pathname: "/order-success",
              params: {
                orderDetails: JSON.stringify(transformedOrderDetails),
              },
            });
            console.log("[Checkout] ✅ Success modal opened!");
          }, 300);
        } else {
          console.log("[Checkout] ❌ Invalid response or missing order data");
          setIsProcessing(false);
        }
      },
      onError: () => {
        setIsProcessing(false);
      },
    },
  });

  const handleStepPress = (stepIndex: number) => {
    const steps: CheckoutStep[] = [
      "shipping",
      "payment",
      "confirmation",
      "succesfull",
    ];
    setCurrentStep(steps[stepIndex]);
  };

  const handleContinue = () => {
    setIsProcessing(true);
    if (currentStep === "shipping") {
      // Trigger shipping form submission
      if (shippingRef.current?.handleContinue) {
        shippingRef.current.handleContinue();
      }
    } else if (currentStep === "payment") {
      // Trigger payment step submission
      if (paymentRef.current?.handleContinue) {
        paymentRef.current.handleContinue();
      }
    } else if (currentStep === "confirmation") {
      // Complete the order
      console.log("[Checkout] Completing order with sessionId:", sessionId);
      completeCheckout({
        data: {
          sessionId,
        },
      });
    }
  };

  const handleShippingComplete = (newSessionId: string) => {
    console.log("[Checkout] Shipping step completed, sessionId:", newSessionId);
    setSessionId(newSessionId);
    setIsProcessing(false);
    setCurrentStep("payment");
  };

  const handlePaymentComplete = () => {
    console.log("[Checkout] Payment step completed, moving to confirmation");
    setIsProcessing(false);
    setCurrentStep("confirmation");
  };

  const getCurrentStepIndex = () => {
    const steps: CheckoutStep[] = ["shipping", "payment", "confirmation"];
    return steps.indexOf(currentStep);
  };

  const getStepStatus = (index: number) => {
    const currentIndex = getCurrentStepIndex();
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "active";
    return "pending";
  };

  const getSections = () => {
    if (currentStep === "shipping") {
      return [{ id: "shipping-addresses", type: "shipping-addresses" }];
    } else if (currentStep === "payment") {
      return [{ id: "payment-methods", type: "payment-methods" }];
    } else if (currentStep === "confirmation") {
      return [{ id: "confirmation", type: "confirmation" }];
    }
    return [];
  };

  const renderSection = ({ item }: { item: any }) => {
    switch (item.type) {
      case "shipping-addresses":
        return (
          <Shipping
            ref={shippingRef}
            sessionId={sessionId}
            onStepComplete={handleShippingComplete}
            onError={() => setIsProcessing(false)}
          />
        );

      case "payment-methods":
        return (
          <PaymentStepper
            ref={paymentRef}
            sessionId={sessionId}
            onStepComplete={handlePaymentComplete}
            onError={() => setIsProcessing(false)}
          />
        );

      case "confirmation":
        return (
          <Confirmation
            sessionId={sessionId}
            onSummaryLoaded={setCheckoutSummary}
          />
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 80}
    >
      <YStack backgroundColor="$background" flex={1}>
        <CheckoutStepper
          steps={[
            { label: "Shipping", status: getStepStatus(0) },
            { label: "Payment", status: getStepStatus(1) },
            { label: "Confirmation", status: getStepStatus(2) },
          ]}
          currentStep={getCurrentStepIndex()}
          onStepPress={handleStepPress}
        />
        <FlatList
          data={getSections()}
          keyExtractor={(item) => item.id}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: getTokenValue("$2xl"),
          }}
        />
        <>
          {currentStep === "confirmation" && (
            <>
              <Animated.View
                style={{
                  opacity: animatedOpacity,

                  maxHeight: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200], // Adjust this value based on your content height
                  }),
                  overflow: "hidden",
                }}
              >
                <Divider />
                <YStack paddingHorizontal={"$md"}>
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
                  <XStack
                    paddingVertical={"$sm"}
                    justifyContent="space-between"
                  >
                    <TextSMSemiBold>
                      Subtotal ({checkoutSummary?.items?.length || 0} Items)
                    </TextSMSemiBold>
                    <TextSMSemiBold>
                      US${checkoutSummary?.pricing?.subtotal?.toFixed(2)}
                    </TextSMSemiBold>
                  </XStack>
                  {(checkoutSummary?.pricing?.discountAmount || 0) > 0 && (
                    <XStack
                      paddingVertical={"$sm"}
                      justifyContent="space-between"
                    >
                      <TextSMRegular color="$secondary">Discount</TextSMRegular>
                      <TextSMSemiBold color="$green">
                        US$
                        {checkoutSummary?.pricing?.discountAmount?.toFixed(2) ||
                          "0.00"}
                      </TextSMSemiBold>
                    </XStack>
                  )}
                  {(checkoutSummary?.pricing?.couponDiscount || 0) > 0 && (
                    <XStack
                      paddingVertical={"$sm"}
                      justifyContent="space-between"
                    >
                      <TextSMRegular color="$secondary">
                        {"Coupon Discount"}
                      </TextSMRegular>
                      <TextSMSemiBold color="$green">
                        US$
                        {checkoutSummary?.pricing?.couponDiscount?.toFixed(2) ||
                          "0.00"}
                      </TextSMSemiBold>
                    </XStack>
                  )}
                  <XStack
                    paddingVertical={"$sm"}
                    justifyContent="space-between"
                  >
                    <TextSMRegular color="$secondary">Taxes</TextSMRegular>
                    <TextSMSemiBold>
                      {/* {checkoutSummary?.pricing?.currency || "$"} */}
                      US${checkoutSummary?.pricing?.tax?.toFixed(2) || "0.00"}
                    </TextSMSemiBold>
                  </XStack>
                  <XStack
                    paddingVertical={"$sm"}
                    justifyContent="space-between"
                  >
                    <TextSMRegular color="$secondary">
                      {"Delivery Fee"}
                    </TextSMRegular>
                    <TextSMSemiBold>
                      US$
                      {checkoutSummary?.pricing?.shippingCost?.toFixed(2) ||
                        "0.00"}
                    </TextSMSemiBold>
                  </XStack>
                  <Spacer size={"$md"} />
                </YStack>
              </Animated.View>
              <YStack paddingHorizontal={"$md"}>
                <Divider />
                <Spacer size={"$sm"} />
                <OpTouch onPress={toggleOrderSummary}>
                  <XStack justifyContent="space-between">
                    <TextSMSemiBold>{"GrandTotal"}</TextSMSemiBold>
                    <XStack alignItems="center">
                      <TextMDBold>
                        US$
                        {checkoutSummary?.pricing?.grandTotal?.toFixed(2) ||
                          "0.00"}
                      </TextMDBold>
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
                <PrimaryButton
                  label="Complete Order"
                  onPress={handleContinue}
                  icon={
                    <AppImage
                      name="shieldCheck"
                      tintColor={getTokenValue("$white")}
                      size={16}
                    />
                  }
                  isLoading={isProcessing}
                />
              </YStack>
            </>
          )}
          {currentStep !== "confirmation" && (
            <YStack paddingHorizontal={"$md"}>
              <PrimaryButton
                label="Continue"
                onPress={handleContinue}
                isLoading={isProcessing}
              />
            </YStack>
          )}
        </>
        <Spacer size={bottomSafeAreaInset} />
      </YStack>
    </KeyboardAvoidingView>
  );
};
export default CheckoutScreen;
