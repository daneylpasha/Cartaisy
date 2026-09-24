import React from "react";

/**
 * Expo web stand-in for @stripe/stripe-react-native.
 * The native package imports codegenNativeCommands, which Metro rejects on web.
 * Shopper checkout on web still uses the hosted Shopify URL. Card and wallet
 * entry stay on iOS and Android.
 */
export const StripeProvider = ({
  children,
}: {
  children?: React.ReactNode;
  publishableKey?: string;
  urlScheme?: string;
  merchantIdentifier?: string;
}) => <>{children}</>;

export const CardField = () => null;

export const PlatformPayButton = () => null;

export const useStripe = () => ({
  createPaymentMethod: async () => ({
    error: { message: "Card entry is available in the iOS and Android app." },
  }),
});

export const usePlatformPay = () => ({
  createPlatformPayPaymentMethod: async () => ({
    error: { message: "Wallet pay is available in the iOS and Android app." },
  }),
});

export const isPlatformPaySupported = async () => false;

export const PlatformPay = {
  PaymentType: { Immediate: "Immediate" },
  ButtonType: { Pay: "Pay" },
  ButtonStyle: { Black: "Black" },
};
