import { customInstance } from "@/api/apiClient";
import {
  useApplyPromoCode,
  useGetCheckoutSummary,
} from "@/api/generated/checkout/checkout";
import { TextMDSemiBold, TextSMBold, TextXSRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { CatalogUnavailableState } from "@/components/molecules/CatalogUnavailableState";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import OrderListItems from "@/components/organisms/checkout/OrderListItems";
import { t } from "@/translations";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { getCatalogUnavailableMessage } from "@/utils/catalogUnavailableError";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
import { PrimaryButton } from "../buttons";
import { SectionHeader } from "../SectionHeader";

interface ConfirmationProps {
  sessionId: string;
  onSummaryLoaded?: (summary: any) => void;
  onInputFocus?: () => void;
  isKeyboardVisible?: boolean;
  onUnavailableError?: (error: unknown) => void;
}

const Confirmation = ({
  sessionId,
  onSummaryLoaded,
  onInputFocus,
  isKeyboardVisible,
  onUnavailableError,
}: ConfirmationProps) => {
  const storeCurrency = useStoreConfigStore((state) => state.currency);
  const form = useForm();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isRemovingPromo, setIsRemovingPromo] = useState(false);

  // Debug: Log when component mounts/updates
  React.useEffect(() => {
    console.log("[Confirmation] Component rendered with sessionId:", sessionId);
  }, [sessionId]);

  // Fetch checkout summary
  const {
    data: summaryResponse,
    error: summaryError,
    isLoading,
    refetch,
  } = useGetCheckoutSummary(sessionId, {
    query: {
      enabled: !!sessionId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0, // Always fetch fresh data
    },
  });

  const summary = summaryResponse?.data;
  const summaryUnavailableMessage =
    getCatalogUnavailableMessage(summaryError);

  // Surface store-unavailable summary failures to the parent so the checkout
  // stepper and "Complete Order" action bar are blocked, matching every other
  // unavailable path (promo apply/remove, shipping, payment, complete order).
  React.useEffect(() => {
    if (summaryUnavailableMessage) {
      onUnavailableError?.(summaryError);
    }
  }, [summaryUnavailableMessage, summaryError, onUnavailableError]);

  // Debug: Log API response
  React.useEffect(() => {
    console.log("[Confirmation] API Response:", {
      success: summaryResponse?.success,
      hasData: !!summary,
      itemsCount: summary?.items?.length,
      items: summary?.items,
      fullSummary: summary,
    });
  }, [summaryResponse, summary]);

  // Calculate correct pricing from items array
  const calculatedPricing = React.useMemo(() => {
    if (!summary?.items || summary.items.length === 0) {
      return summary?.pricing || null;
    }

    // Calculate subtotal from items
    const subtotal = summary.items.reduce((total: number, item: any) => {
      return total + (item.total || 0);
    }, 0);

    // Use backend values for other fields (they should be correct)
    const pricing = {
      currency: summary.pricing?.currency || storeCurrency,
      subtotal: subtotal,
      discountAmount: summary.pricing?.discountAmount || 0,
      couponDiscount: summary.pricing?.couponDiscount || 0,
      tax: summary.pricing?.tax || 0,
      shippingCost: summary.pricing?.shippingCost || 0,
      grandTotal:
        subtotal -
        (summary.pricing?.discountAmount || 0) -
        (summary.pricing?.couponDiscount || 0) +
        (summary.pricing?.tax || 0) +
        (summary.pricing?.shippingCost || 0),
    };

    return pricing;
  }, [summary]);

  // Notify parent when summary is loaded with calculated pricing
  React.useEffect(() => {
    if (summary && onSummaryLoaded) {
      // Override pricing with calculated values
      const updatedSummary = {
        ...summary,
        pricing: calculatedPricing,
      };
      onSummaryLoaded(updatedSummary);
    }
  }, [summary, calculatedPricing, onSummaryLoaded]);

  // Apply promo code mutation
  const { mutate: applyPromo } = useApplyPromoCode({
    mutation: {
      onSuccess: () => {
        console.log("[Confirmation] Promo code applied successfully");
        setIsApplyingPromo(false);
        setPromoError(null); // Clear any previous errors
        form.setValue("promocode", "");
        // Refetch checkout summary to get updated pricing
        refetch();
        // No alert modal - green banner will show automatically via summary.promoCode
      },
      onError: (error: any) => {
        setIsApplyingPromo(false);
        if (getCatalogUnavailableMessage(error)) {
          onUnavailableError?.(error);
          return;
        }

        // Don't log to console to avoid triggering global error toasts
        // Extract error message from different possible paths
        const rawErrorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "";

        // Convert technical errors to user-friendly messages
        let userFriendlyMessage = "Invalid promo code. Please try again.";

        if (rawErrorMessage) {
          const lowerError = rawErrorMessage.toLowerCase();

          // Check for specific error patterns and provide friendly messages
          if (lowerError.includes("shopify") || lowerError.includes("api error") || lowerError.includes("nullability")) {
            userFriendlyMessage = "Unable to apply promo code. Please try again later.";
          } else if (lowerError.includes("invalid") || lowerError.includes("not found") || lowerError.includes("does not exist")) {
            userFriendlyMessage = "This promo code is invalid or has expired.";
          } else if (lowerError.includes("expired")) {
            userFriendlyMessage = "This promo code has expired.";
          } else if (lowerError.includes("minimum") || lowerError.includes("not applicable")) {
            userFriendlyMessage = "This promo code cannot be applied to your order.";
          } else if (lowerError.includes("already") || lowerError.includes("used")) {
            userFriendlyMessage = "This promo code has already been used.";
          } else if (!lowerError.includes("failed to fetch") && rawErrorMessage.length < 100) {
            // Use the raw message if it's short and doesn't contain technical jargon
            userFriendlyMessage = rawErrorMessage;
          }
        }

        showAlert({
          type: "error",
          title: "Error",
          message: userFriendlyMessage,
          buttons: [{ text: "OK" }],
        });
        // Set error to show in red banner instead of modal
        setPromoError(userFriendlyMessage);
      },
    },
  });

  // Remove promo code handler
  const handleRemovePromoCode = async () => {
    try {
      setIsRemovingPromo(true);
      setPromoError(null);

      // Direct API call using customInstance
      await customInstance({
        url: `/checkout/remove-promo`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        data: { sessionId },
      });

      console.log("[Confirmation] Promo code removed successfully");
      setIsRemovingPromo(false);
      // Clear the input field
      form.setValue("promocode", "");
      // Refetch checkout summary to get updated pricing
      refetch();
    } catch (error: any) {
      console.error("[Confirmation] Failed to remove promo code:", error);
      if (getCatalogUnavailableMessage(error)) {
        onUnavailableError?.(error);
      }
      setIsRemovingPromo(false);
    }
  };

  const handleApplyPromo = () => {
    // Dismiss keyboard when Apply is pressed
    Keyboard.dismiss();

    const promoCode = form.getValues("promocode");
    if (!promoCode || promoCode.trim() === "") {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoError(null); // Clear any previous errors
    setIsApplyingPromo(true);
    applyPromo({
      data: {
        sessionId,
        promoCode: promoCode.trim(),
      },
    });
  };

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingVertical="$2xl"
      >
        <Loader size="large" color="$primary" />
      </YStack>
    );
  }

  // When wired into checkout, the parent renders the full-screen unavailable
  // block (via onUnavailableError above) which gates the action bar. Fall back
  // to a local block only when no parent handler is provided.
  if (summaryUnavailableMessage && !onUnavailableError) {
    return (
      <CatalogUnavailableState
        error={summaryError}
        title="Checkout unavailable"
        onRetry={refetch}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack>
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("checkout.sectionHeader.yourorders")}
          tintColor={"darkgrey"}
          image="list"
          onPressSeeAll={() => {}}
        />
        <OrderListItems items={summary?.items || []} />
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("checkout.sectionHeader.deliveryaddress")}
          tintColor={"darkgrey"}
          image="locationUnfilled"
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <XStack
            backgroundColor={"$white"}
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius="$md"
            padding={"$reg"}
            justifyContent="space-between"
          >
            <XStack>
              <YStack marginTop={5}>
                <AppImage
                  name="locationUnfilled"
                  tintColor={getTokenValue("$primary")}
                  width={16}
                  height={20}
                />
              </YStack>
              <Spacer size={"$reg"} />
              <YStack width={"80%"}>
                {(summary?.shippingAddress?.firstName ||
                  summary?.shippingAddress?.lastName) && (
                  <>
                    <TextMDSemiBold>
                      {summary?.shippingAddress?.firstName || ""}{" "}
                      {summary?.shippingAddress?.lastName || ""}
                    </TextMDSemiBold>
                    <Spacer size={"$sm"} />
                  </>
                )}
                <ParagraphSM color="$secondary">
                  {summary?.shippingAddress?.address1 || ""}
                  {summary?.shippingAddress?.address2
                    ? `, ${summary.shippingAddress.address2}`
                    : ""}
                  {`, ${summary?.shippingAddress?.city || ""}, ${
                    summary?.shippingAddress?.province || ""
                  }, ${summary?.shippingAddress?.zip || ""}`}
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
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("checkout.sectionHeader.promocode")}
          tintColor={"darkgrey"}
          image="offerIcon"
        />
        <Spacer size={"$reg"} />

        {summary?.promoCode ? (
          // Show success banner with remove option
          <YStack paddingHorizontal={"$md"}>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              gap="$md"
              borderWidth={1}
              borderColor="$green"
              padding="$reg"
              paddingVertical="$sm"
              borderRadius="$md"
              backgroundColor="#ECFDF5"
            >
              <XStack flex={1} gap="$sm">
                <YStack
                  width={18}
                  height={18}
                  borderRadius="$full"
                  backgroundColor="$green"
                  justifyContent="center"
                  alignItems="center"
                  flexShrink={0}
                  marginTop={5}
                >
                  <AppImage
                    name="check"
                    width={8}
                    height={8}
                    tintColor={getTokenValue("$white")}
                  />
                </YStack>
                <TextSMBold
                  flex={1}
                  color="$darkgrey"
                >{`Promo code "${summary.promoCode}" applied successfully!`}</TextSMBold>
              </XStack>
              <YStack opacity={isRemovingPromo ? 0.5 : 1} flexShrink={0}>
                <OpTouch
                  onPress={handleRemovePromoCode}
                  disabled={isRemovingPromo}
                >
                  {isRemovingPromo ? (
                    <Loader size="small" color="$primary" />
                  ) : (
                    <AppImage
                      name="closeIcon"
                      width={12}
                      height={12}
                      tintColor={getTokenValue("$darkgrey")}
                    />
                  )}
                </OpTouch>
              </YStack>
            </XStack>
          </YStack>
        ) : (
          // Show input field and apply button
          <>
            <XStack
              justifyContent="space-between"
              paddingHorizontal={"$md"}
              gap="$sm"
            >
              <Controller
                name="promocode"
                control={form.control}
                rules={{}}
                render={({ field, fieldState }) => (
                  <YStack flex={1}>
                    <FormInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder={"Enter Promo Code"}
                      onSubmitEditing={handleApplyPromo}
                      onFocus={onInputFocus}
                    />
                  </YStack>
                )}
              />
              <PrimaryButton
                onPress={handleApplyPromo}
                width={"25%"}
                label="Apply"
                isLoading={isApplyingPromo}
              />
            </XStack>
            {promoError && (
              <>
                <Spacer size={"$reg"} />
                <YStack paddingHorizontal={"$md"}>
                  <XStack
                    gap="$sm"
                    borderWidth={1}
                    borderColor="$error"
                    padding="$reg"
                    paddingVertical="$sm"
                    borderRadius="$md"
                    backgroundColor="#FFF1F2"

                    // alignItems="center"
                  >
                    <YStack
                      width={18}
                      height={18}
                      borderRadius="$full"
                      backgroundColor="$error"
                      justifyContent="center"
                      alignItems="center"
                      flexShrink={0}
                      marginTop={5}
                    >
                      <AppImage
                        name="errorIcon"
                        width={10}
                        height={10}
                        tintColor={getTokenValue("$white")}
                      />
                    </YStack>
                    <TextSMBold flex={1} color="$darkgrey">
                      {promoError}
                    </TextSMBold>
                  </XStack>
                </YStack>
              </>
            )}
          </>
        )}
        <AlertComponent />
        {isKeyboardVisible && <YStack height={50} />}
      </YStack>
    </TouchableWithoutFeedback>
  );
};

export default Confirmation;
