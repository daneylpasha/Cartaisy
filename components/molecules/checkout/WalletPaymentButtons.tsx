import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, ActivityIndicator } from "react-native";
import {
  PlatformPayButton,
  PlatformPay,
  usePlatformPay,
  isPlatformPaySupported,
} from "@stripe/stripe-react-native";
import { YStack, XStack, getTokenValue } from "tamagui";
import { TextSMMedium } from "@/components/atoms";
import { Divider } from "@/components/atoms/Divider";

// Error codes that indicate user cancelled the payment
const USER_CANCELLED_CODES = ["Canceled", "cancelled", "user_canceled", "canceled"];

/**
 * Maps Stripe/Platform Pay error codes to user-friendly messages
 */
const getErrorMessage = (error: any): { message: string; isCancelled: boolean } => {
  const errorCode = error?.code || "";
  const errorMessage = error?.message || "";
  const paymentMethod = Platform.OS === "ios" ? "Apple Pay" : "Google Pay";

  // Check if user cancelled
  if (
    USER_CANCELLED_CODES.some(
      (code) =>
        errorCode.toLowerCase().includes(code.toLowerCase()) ||
        errorMessage.toLowerCase().includes(code.toLowerCase())
    )
  ) {
    return { message: "", isCancelled: true };
  }

  // Map specific error codes to friendly messages
  if (errorCode === "Failed" || errorMessage.includes("failed")) {
    return {
      message: `${paymentMethod} payment could not be completed. Please try again or use a different payment method.`,
      isCancelled: false,
    };
  }

  if (errorMessage.includes("not available") || errorMessage.includes("not supported")) {
    return {
      message: `${paymentMethod} is not available on this device. Please use a card instead.`,
      isCancelled: false,
    };
  }

  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return {
      message: "Unable to connect. Please check your internet connection and try again.",
      isCancelled: false,
    };
  }

  if (errorMessage.includes("merchant") || errorMessage.includes("configuration")) {
    return {
      message: `${paymentMethod} is temporarily unavailable. Please use a card to complete your purchase.`,
      isCancelled: false,
    };
  }

  // Default fallback message
  return {
    message: `Unable to process ${paymentMethod} payment. Please try again or use a different payment method.`,
    isCancelled: false,
  };
};

interface WalletPaymentButtonsProps {
  amount: number; // Amount in dollars (e.g., 29.99)
  currency?: string;
  countryCode?: string; // Merchant country code (default: "US")
  onPaymentSuccess: (paymentMethodId: string, paymentType: "apple_pay" | "google_pay") => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  label?: string;
}

export const WalletPaymentButtons: React.FC<WalletPaymentButtonsProps> = ({
  amount,
  currency = "USD",
  countryCode = "US",
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  label,
}) => {
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { createPlatformPayPaymentMethod } = usePlatformPay();

  useEffect(() => {
    checkPlatformPaySupport();
  }, []);

  const checkPlatformPaySupport = async () => {
    setIsChecking(true);
    try {
      if (Platform.OS === "ios") {
        console.log("[WalletPay] Checking Apple Pay support...");
        console.log("[WalletPay] Merchant ID from env:", process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID);
        const applePaySupported = await isPlatformPaySupported();
        console.log("[WalletPay] Apple Pay supported:", applePaySupported);
        if (!applePaySupported) {
          console.log("[WalletPay] Apple Pay not supported - possible reasons:");
          console.log("[WalletPay] - No cards added to Apple Wallet");
          console.log("[WalletPay] - Merchant ID not configured correctly");
          console.log("[WalletPay] - Running on simulator without Apple Pay capability");
        }
        setIsApplePaySupported(applePaySupported);
      } else if (Platform.OS === "android") {
        console.log("[WalletPay] Checking Google Pay support...");
        const googlePaySupported = await isPlatformPaySupported();
        console.log("[WalletPay] Google Pay supported:", googlePaySupported);
        if (!googlePaySupported) {
          console.log("[WalletPay] Google Pay not supported - possible reasons:");
          console.log("[WalletPay] - Google Pay not installed or configured");
          console.log("[WalletPay] - No cards added to Google Pay");
          console.log("[WalletPay] - Device/country not supported");
        }
        setIsGooglePaySupported(googlePaySupported);
      }
    } catch (error: any) {
      console.log("[WalletPay] Error checking platform pay support:", error?.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePlatformPay = async () => {
    if (isProcessing || disabled) return;

    setIsProcessing(true);
    console.log("[WalletPay] Starting platform pay for amount:", amount);

    try {
      // Create a payment method using platform pay
      const { error, paymentMethod } = await createPlatformPayPaymentMethod({
        applePay: {
          cartItems: [
            {
              label: label || "Order Total",
              amount: amount.toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
          merchantCountryCode: countryCode,
          currencyCode: currency,
        },
        googlePay: {
          amount: Math.round(amount * 100), // Google Pay expects cents
          currencyCode: currency,
          testEnv: __DEV__,
          merchantCountryCode: countryCode,
          merchantName: process.env.EXPO_PUBLIC_APP_NAME || "Store",
        },
      });

      if (error) {
        console.log("[WalletPay] Payment error:", { code: error.code, message: error.message });
        const { message, isCancelled } = getErrorMessage(error);

        // Don't show error if user just cancelled - it's expected behavior
        if (isCancelled) {
          console.log("[WalletPay] User cancelled payment");
          return;
        }

        onPaymentError(message);
        return;
      }

      if (paymentMethod) {
        console.log("[WalletPay] Payment method created:", paymentMethod.id);
        const paymentType = Platform.OS === "ios" ? "apple_pay" : "google_pay";
        onPaymentSuccess(paymentMethod.id, paymentType);
      }
    } catch (error: any) {
      console.log("[WalletPay] Unexpected error:", error);
      const { message, isCancelled } = getErrorMessage(error);

      if (!isCancelled) {
        onPaymentError(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if checking support or if neither wallet is supported
  if (isChecking) {
    return (
      <YStack alignItems="center" paddingVertical="$md">
        <ActivityIndicator size="small" color={getTokenValue("$primary")} />
      </YStack>
    );
  }

  const showApplePay = Platform.OS === "ios" && isApplePaySupported;
  const showGooglePay = Platform.OS === "android" && isGooglePaySupported;

  if (!showApplePay && !showGooglePay) {
    return null; // No wallet payment available
  }

  return (
    <YStack>
      {/* Divider - "or" separator */}
      <YStack paddingVertical="$md">
        <XStack alignItems="center" justifyContent="center">
          <YStack flex={1}>
            <Divider />
          </YStack>
          <TextSMMedium color="$secondary" paddingHorizontal="$md">
            or
          </TextSMMedium>
          <YStack flex={1}>
            <Divider />
          </YStack>
        </XStack>
      </YStack>

      {/* Apple Pay Button - iOS only */}
      {showApplePay && (
        <YStack
          borderRadius={12}
          overflow="hidden"
        >
          <PlatformPayButton
            type={PlatformPay.ButtonType.Pay}
            appearance={PlatformPay.ButtonStyle.Black}
            borderRadius={12}
            style={styles.payButton}
            onPress={handlePlatformPay}
            disabled={disabled || isProcessing}
          />
        </YStack>
      )}

      {/* Google Pay Button - Android only */}
      {showGooglePay && (
        <YStack
          borderRadius={12}
          overflow="hidden"
        >
          <PlatformPayButton
            type={PlatformPay.ButtonType.Pay}
            appearance={PlatformPay.ButtonStyle.Black}
            borderRadius={12}
            style={styles.payButton}
            onPress={handlePlatformPay}
            disabled={disabled || isProcessing}
          />
        </YStack>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  payButton: {
    width: "100%",
    height: 50,
  },
});

export default WalletPaymentButtons;
