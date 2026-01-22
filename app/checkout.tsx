import { clearSavedCart } from "@/api/endpoints/cart";
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
import PaymentStepper, {
  PaymentMethodType,
} from "@/components/molecules/checkout/Payment";
import Shipping from "@/components/molecules/checkout/Shipping";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { useAuthGuard } from "@/contexts/AuthGuardContext";
import useAuthStore from "@/store/useAuthStore";

import useCartStore from "@/store/useCartStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { formatPrice } from "@/utils/formatPrice";
import {
  KeyboardAvoiderInsets,
  KeyboardAvoiderView,
} from "@good-react-native/keyboard-avoider";
import { PlatformPay, usePlatformPay } from "@stripe/stripe-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
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

  // Auth guard for blocking guest access
  const { requireAuth, isAuthenticated } = useAuthGuard();

  // Auth store for guest mode detection
  const { token } = useAuthStore();

  // Cart store and clear mutation
  const {
    cartId,
    clearCart: clearCartStore,
    getTotalPrice,
    items,
  } = useCartStore();
  const storeCurrency = useStoreConfigStore((state) => state.currency);
  const cartCurrency = storeCurrency; // Always use store config currency
  const { mutate: clearCartAPI } = useClearCart();

  const [sessionId, setSessionId] = useState<string>(initialSessionId || "");
  // Always start at shipping step (no guest checkout)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");

  // Payment type state (card, apple_pay, google_pay)
  const [walletPaymentType, setWalletPaymentType] =
    useState<PaymentMethodType | null>(null);

  // Calculate order total from cart for wallet pay display
  const orderTotal = getTotalPrice();

  // Block guest access - show login modal and redirect back
  useEffect(() => {
    if (!isAuthenticated) {
      // Show login modal
      requireAuth({
        type: "checkout",
        callback: () => {
          // After successful login, user will be back on checkout (current screen)
          // No action needed as they're already on checkout
        },
      });
      // Go back to previous screen (cart)
      router.back();
    }
  }, [isAuthenticated]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const shippingRef = useRef<any>(null);
  const paymentRef = useRef<any>(null);
  const flatListRef = useRef<any>(null);

  // Platform pay hook
  const { createPlatformPayPaymentMethod } = usePlatformPay();
  const { showAlert, AlertComponent } = useCustomAlert();

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

  // Track keyboard visibility and close expanded summary when keyboard opens
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Use keyboardWillShow for iOS (fires earlier), keyboardDidShow for Android
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardShowListener = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      if (open) {
        setOpen(false);
      }
      // Auto scroll to show input fields when keyboard opens
      if (flatListRef.current) {
        const scrollDelay = Platform.OS === "android" ? 300 : 50;
        setTimeout(() => {
          if (currentStep === "confirmation") {
            flatListRef.current?.scrollToOffset({
              offset: 2000,
              animated: true,
            });
          } else if (currentStep === "shipping") {
            flatListRef.current?.scrollToOffset({
              offset: 300,
              animated: true,
            });
          }
        }, scrollDelay);
      }
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [open, currentStep]);

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
              orderData.email ||
              checkoutSummary?.email ||
              checkoutSummary?.shippingAddress?.email ||
              "",
            phone:
              orderData.phone ||
              checkoutSummary?.contactNumber ||
              checkoutSummary?.shippingAddress?.phone ||
              "",
            shippingAddress:
              orderData.shippingAddress ||
              checkoutSummary?.shippingAddress ||
              {},
            payment: {
              cardBrand:
                walletPaymentType === "apple_pay"
                  ? "Apple Pay"
                  : walletPaymentType === "google_pay"
                  ? "Google Pay"
                  : orderData.payment?.method || "card",
              last4:
                walletPaymentType && walletPaymentType !== "card"
                  ? "" // No last4 for wallet payments
                  : orderData.payment?.last4 ||
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

          // Clear saved cart from customer profile (fire and forget)
          if (token) {
            clearSavedCart();
          }

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          console.log("[Checkout] ✅ Orders cache invalidated");

          // Invalidate product-related caches to refresh quantities after order
          // Use predicate to match all product queries (e.g., /products/abc123)
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey[0];
              return typeof key === "string" && key.startsWith("/products/");
            },
          });
          // Invalidate homescreen and collections for quantity updates
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey[0];
              return (
                typeof key === "string" &&
                (key.startsWith("/customer/homescreen") ||
                  key.startsWith("/collections/"))
              );
            },
          });
          console.log("[Checkout] ✅ Product caches invalidated for quantity refresh");

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

  // Handle platform pay payment
  const handlePlatformPayPayment = async () => {
    try {
      // Use grandTotal from checkout summary (includes subtotal + shipping + tax)
      const grandTotal = checkoutSummary?.pricing?.grandTotal || orderTotal;
      console.log("[Checkout] Starting platform pay for amount:", grandTotal);

      const { error, paymentMethod } = await createPlatformPayPaymentMethod({
        applePay: {
          cartItems: [
            {
              label: "Subtotal",
              amount: (
                checkoutSummary?.pricing?.subtotal || orderTotal
              ).toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
            {
              label: "Shipping",
              amount: (checkoutSummary?.pricing?.shippingCost || 0).toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
            {
              label: "Tax",
              amount: (checkoutSummary?.pricing?.tax || 0).toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
            {
              label: process.env.EXPO_PUBLIC_APP_NAME || "Total",
              amount: grandTotal.toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
          merchantCountryCode: "US",
          currencyCode: "USD",
        },
        googlePay: {
          amount: Math.round(grandTotal * 100),
          currencyCode: "USD",
          testEnv: __DEV__,
          merchantCountryCode: "US",
          merchantName: process.env.EXPO_PUBLIC_APP_NAME || "Store",
        },
      });

      if (error) {
        console.log("[Checkout] Platform pay error:", error);
        // Check if user cancelled
        if (
          error.code === "Canceled" ||
          error.message?.toLowerCase().includes("cancel")
        ) {
          console.log("[Checkout] User cancelled platform pay");
          setIsProcessing(false);
          return;
        }
        showAlert({
          type: "error",
          title: "Payment Failed",
          message: "Unable to process payment. Please try again.",
          buttons: [{ text: "OK" }],
        });
        setIsProcessing(false);
        return;
      }

      if (paymentMethod) {
        console.log(
          "[Checkout] Platform pay successful, payment method:",
          paymentMethod.id
        );

        // For Google Pay/Apple Pay, pass the payment method ID directly
        // Note: Platform pay payment methods are one-time use and cannot be saved via step2
        // The backend will create and confirm the payment intent using this payment method
        console.log(
          "[Checkout] Completing checkout with platform pay payment method"
        );
        completeCheckout({
          data: {
            sessionId,
            paymentMethodId: paymentMethod.id,
          },
        });
      }
    } catch (error) {
      console.log("[Checkout] Platform pay exception:", error);
      setIsProcessing(false);
      showAlert({
        type: "error",
        title: "Payment Failed",
        message: "An unexpected error occurred. Please try again.",
        buttons: [{ text: "OK" }],
      });
    }
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
      // Check if platform pay was selected
      if (walletPaymentType && walletPaymentType !== "card") {
        console.log("[Checkout] Processing platform pay:", walletPaymentType);
        handlePlatformPayPayment();
      } else {
        // Complete the order for card payment
        console.log(
          "[Checkout] Completing card order with sessionId:",
          sessionId
        );
        completeCheckout({
          data: {
            sessionId,
          },
        });
      }
    }
  };

  const handleShippingComplete = (newSessionId: string) => {
    console.log("[Checkout] Shipping step completed, sessionId:", newSessionId);
    setSessionId(newSessionId);
    setIsProcessing(false);
    setCurrentStep("payment");
  };

  const handlePaymentComplete = (
    paymentMethodId?: string,
    paymentType?: PaymentMethodType
  ) => {
    console.log("[Checkout] Payment step completed");
    console.log("[Checkout] Payment type:", paymentType);
    console.log("[Checkout] Payment method ID:", paymentMethodId);

    // Store payment type if platform pay selected
    if (paymentType && paymentType !== "card") {
      setWalletPaymentType(paymentType);
      console.log("[Checkout] Platform pay selected:", paymentType);
    } else {
      setWalletPaymentType(null);
    }

    // Move to confirmation step for all payment types
    // Platform pay sheet will be shown on "Complete Order" press
    setIsProcessing(false);
    setCurrentStep("confirmation");
  };

  const getCurrentStepIndex = () => {
    // Only authenticated users can checkout - 3 steps: shipping, payment, confirmation
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
            currency={cartCurrency}
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
    <YStack flex={1} backgroundColor="$background">
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
        ref={flatListRef}
        style={{ flex: 1 }}
        data={getSections()}
        keyExtractor={(item) => item.id}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          paddingBottom: 80,
        }}
        ListFooterComponent={<KeyboardAvoiderInsets extraSpace={280} />}
      />
      {currentStep !== "confirmation" && (
        <KeyboardAvoiderView>
          <YStack
            paddingHorizontal="$md"
            paddingBottom={isKeyboardVisible ? 0 : Math.max(bottomSafeAreaInset, 16)}
            backgroundColor="$background"
          >
            <PrimaryButton
              label="Continue"
              onPress={handleContinue}
              isLoading={isProcessing}
            />
          </YStack>
        </KeyboardAvoiderView>
      )}

      {currentStep === "confirmation" && (
        <KeyboardAvoiderView>
          {!isKeyboardVisible && (
            <Animated.View
              style={{
                opacity: animatedOpacity,
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
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
                <XStack paddingVertical={"$sm"} justifyContent="space-between">
                  <TextSMSemiBold>
                    Subtotal ({checkoutSummary?.items?.length || 0} Items)
                  </TextSMSemiBold>
                  <TextSMSemiBold>
                    {formatPrice(
                      checkoutSummary?.pricing?.subtotal,
                      cartCurrency
                    )}
                  </TextSMSemiBold>
                </XStack>
                {(checkoutSummary?.pricing?.discountAmount || 0) > 0 && (
                  <XStack
                    paddingVertical={"$sm"}
                    justifyContent="space-between"
                  >
                    <TextSMRegular color="$secondary">Discount</TextSMRegular>
                    <TextSMSemiBold color="$green">
                      -
                      {formatPrice(
                        checkoutSummary?.pricing?.discountAmount,
                        cartCurrency
                      )}
                    </TextSMSemiBold>
                  </XStack>
                )}
                <XStack paddingVertical={"$sm"} justifyContent="space-between">
                  <TextSMRegular color="$secondary">Taxes</TextSMRegular>
                  <TextSMSemiBold>
                    {formatPrice(checkoutSummary?.pricing?.tax, cartCurrency)}
                  </TextSMSemiBold>
                </XStack>
                <XStack paddingVertical={"$sm"} justifyContent="space-between">
                  <TextSMRegular color="$secondary">
                    {"Delivery Fee"}
                  </TextSMRegular>
                  <TextSMSemiBold>
                    {formatPrice(
                      checkoutSummary?.pricing?.shippingCost,
                      cartCurrency
                    )}
                  </TextSMSemiBold>
                </XStack>
                <Spacer size={"$md"} />
              </YStack>
            </Animated.View>
          )}
          <YStack
            paddingHorizontal={"$md"}
            paddingBottom={isKeyboardVisible ? 0 : Math.max(bottomSafeAreaInset, 16)}
            paddingTop={"$sm"}
            backgroundColor="$background"
          >
            <Divider />
            <Spacer size={"$sm"} />
            <OpTouch
              onPress={isKeyboardVisible ? undefined : toggleOrderSummary}
            >
              <XStack justifyContent="space-between">
                <TextSMSemiBold>{"GrandTotal"}</TextSMSemiBold>
                <XStack alignItems="center">
                  <TextMDBold>
                    {formatPrice(
                      checkoutSummary?.pricing?.grandTotal,
                      cartCurrency
                    )}
                  </TextMDBold>
                  {!isKeyboardVisible && (
                    <>
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
                    </>
                  )}
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
        </KeyboardAvoiderView>
      )}
      <AlertComponent />
    </YStack>
  );
};
export default CheckoutScreen;
