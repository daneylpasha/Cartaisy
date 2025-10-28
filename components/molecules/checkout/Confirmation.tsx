import {
  useApplyPromoCode,
  useGetCheckoutSummary,
} from "@/api/generated/checkout/checkout";
import { TextMDSemiBold, TextSMBold, TextXSRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Loader } from "@/components/atoms/Loader";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import OrderListItems from "@/components/organisms/checkout/OrderListItems";
import { SHADOW_STYLES } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
import { PrimaryButton } from "../buttons";
import { SectionHeader } from "../SectionHeader";

interface ConfirmationProps {
  sessionId: string;
  onSummaryLoaded?: (summary: any) => void;
}

const Confirmation = ({ sessionId, onSummaryLoaded }: ConfirmationProps) => {
  const form = useForm();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Fetch checkout summary
  const {
    data: summaryResponse,
    isLoading,
    refetch,
  } = useGetCheckoutSummary(sessionId, {
    query: {
      enabled: !!sessionId,
    },
  });

  const summary = summaryResponse?.data;

  // Notify parent when summary is loaded
  React.useEffect(() => {
    if (summary && onSummaryLoaded) {
      onSummaryLoaded(summary);
    }
  }, [summary, onSummaryLoaded]);

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
        // Don't log to console to avoid triggering global error toasts
        setIsApplyingPromo(false);

        // Extract error message from different possible paths
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Invalid promo code. Please try again.";

        // Set error to show in red banner instead of modal
        setPromoError(errorMessage);
      },
    },
  });

  const handleApplyPromo = () => {
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
  return (
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
          borderRadius="$2xl"
          padding={"$reg"}
          justifyContent="space-between"
          style={SHADOW_STYLES}
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
      <XStack justifyContent="space-between" paddingHorizontal={"$md"}>
        <Controller
          name="promocode"
          control={form.control}
          rules={{}}
          render={({ field, fieldState }) => (
            <FormInput
              width={"70%"}
              value={field.value}
              onChangeText={field.onChange}
              placeholder={"ENTER PROMO CODE"}

              // secureTextEntry
              // error={fieldState.error?.message}
            />
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
              gap="$xs"
              borderWidth={1}
              borderColor="$error"
              padding="$sm"
              borderRadius="$2xl"
              backgroundColor="#FFF1F2"
            >
              <YStack marginTop={"$xs"}>
                <AppImage
                  name="errorIcon"
                  width={16}
                  height={16}
                  tintColor={getTokenValue("$error")}
                />
              </YStack>
              <TextSMBold color="$error">{promoError}</TextSMBold>
            </XStack>
          </YStack>
        </>
      )}
      {summary?.promoCode && (
        <>
          <Spacer size={"$reg"} />
          <YStack paddingHorizontal={"$md"}>
            <XStack
              gap="$xs"
              borderWidth={1}
              borderColor="$green"
              padding="$sm"
              borderRadius="$2xl"
              backgroundColor="#ECFDF5"
            >
              <YStack marginTop={"$xs"}>
                <AppImage
                  name="errorIcon"
                  width={16}
                  height={16}
                  tintColor={getTokenValue("$green")}
                />
              </YStack>
              <TextSMBold>{`Promo code "${summary.promoCode}" applied successfully!`}</TextSMBold>
            </XStack>
          </YStack>
        </>
      )}
      <AlertComponent />
    </YStack>
  );
};

export default Confirmation;

const Styles = StyleSheet.create({
  addressContainer: {
    paddingHorizontal: tokens.space.md,
  },
});
