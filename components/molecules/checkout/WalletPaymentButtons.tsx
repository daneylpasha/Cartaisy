import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, ActivityIndicator } from "react-native";
import {
  PlatformPayButton,
  PlatformPay,
  usePlatformPay,
  isPlatformPaySupported,
} from "@stripe/stripe-react-native";
import { YStack, XStack, getTokenValue } from "tamagui";
import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { Divider } from "@/components/atoms/Divider";
import { Spacer } from "@/components/atoms/Spacer";

interface WalletPaymentButtonsProps {
  amount: number; // Amount in dollars (e.g., 29.99)
  currency?: string;
  onPaymentSuccess: (paymentMethodId: string, paymentType: "apple_pay" | "google_pay") => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  label?: string;
}

export const WalletPaymentButtons: React.FC<WalletPaymentButtonsProps> = ({
  amount,
  currency = "USD",
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  label,
}) => {
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { confirmPlatformPayPayment, createPlatformPayPaymentMethod } = usePlatformPay();

  useEffect(() => {
    checkPlatformPaySupport();
  }, []);

  const checkPlatformPaySupport = async () => {
    setIsChecking(true);
    try {
      if (Platform.OS === "ios") {
        const applePaySupported = await isPlatformPaySupported();
        console.log("[WalletPay] Apple Pay supported:", applePaySupported);
        setIsApplePaySupported(applePaySupported);
      } else if (Platform.OS === "android") {
        // For Android, check Google Pay support
        // The isPlatformPaySupported function checks based on the platform
        const googlePaySupported = await isPlatformPaySupported();
        console.log("[WalletPay] Google Pay supported:", googlePaySupported);
        setIsGooglePaySupported(googlePaySupported);
      }
    } catch (error) {
      console.error("[WalletPay] Error checking platform pay support:", error);
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
          merchantCountryCode: "US",
          currencyCode: currency,
        },
        googlePay: {
          amount: Math.round(amount * 100), // Google Pay expects cents
          currencyCode: currency,
          testEnv: __DEV__,
          merchantCountryCode: "US",
        },
      });

      if (error) {
        console.error("[WalletPay] Payment method creation failed:", error);
        onPaymentError(error.message || "Payment failed");
        return;
      }

      if (paymentMethod) {
        console.log("[WalletPay] Payment method created:", paymentMethod.id);
        const paymentType = Platform.OS === "ios" ? "apple_pay" : "google_pay";
        onPaymentSuccess(paymentMethod.id, paymentType);
      }
    } catch (error: any) {
      console.error("[WalletPay] Error:", error);
      onPaymentError(error?.message || "An unexpected error occurred");
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
      {/* Apple Pay Button - iOS only */}
      {showApplePay && (
        <YStack>
          <PlatformPayButton
            type={PlatformPay.ButtonType.Pay}
            appearance={PlatformPay.ButtonStyle.Black}
            borderRadius={8}
            style={styles.payButton}
            onPress={handlePlatformPay}
            disabled={disabled || isProcessing}
          />
        </YStack>
      )}

      {/* Google Pay Button - Android only */}
      {showGooglePay && (
        <YStack>
          <PlatformPayButton
            type={PlatformPay.ButtonType.Pay}
            appearance={PlatformPay.ButtonStyle.Black}
            borderRadius={8}
            style={styles.payButton}
            onPress={handlePlatformPay}
            disabled={disabled || isProcessing}
          />
        </YStack>
      )}

      {/* Divider between wallet pay and card options */}
      <YStack paddingVertical="$md">
        <XStack alignItems="center" justifyContent="center">
          <YStack flex={1}>
            <Divider />
          </YStack>
          <TextSMMedium color="$secondary" paddingHorizontal="$md">
            or pay with card
          </TextSMMedium>
          <YStack flex={1}>
            <Divider />
          </YStack>
        </XStack>
      </YStack>
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
