import { useLogin } from "@/api/hooks/useAuth";
import { getCart } from "@/api/generated/cart/cart";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import {
  HeadingSMBold,
  ParagraphMD,
  TextMDMedium,
  TextMDSemiBold,
  TextSMSemiBold,
} from "@/components/atoms/texts";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { SHADOW_STYLES } from "@/constants/styles";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import useUserStore from "@/store/useUserStore";
import { t } from "@/translations";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
import { BaseBottomSheetModal } from "../bottomSheet/BottomSheetModal";

type LoginForm = {
  email: string;
  password: string;
};

export interface LoginBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface LoginBottomSheetProps {
  onLoginSuccess?: () => void;
  onSignUpPress?: () => void;
  onDismiss?: () => void;
}

export const LoginBottomSheet = forwardRef<LoginBottomSheetRef, LoginBottomSheetProps>(
  ({ onLoginSuccess, onSignUpPress, onDismiss }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
    const [isChecked, setIsChecked] = useState(false);

    const { setToken, setProfileComplete, guestSessionId, clearGuestSession } = useAuthStore();
    const { setUser } = useUserStore();

    const { mutateAsync: loginUser, isPending: isLoggingIn } = useLogin({
      onSuccess: async (data) => {
        console.log("[LoginBottomSheet] API Response:", JSON.stringify(data, null, 2));

        if (data?.data?.token) {
          setToken(data.data.token, data.data.refreshToken);
        }

        if (data?.data?.user) {
          setUser(data.data.user);
        }

        setProfileComplete(true);

        if (guestSessionId) {
          console.log("[LoginBottomSheet] Guest session detected, cart will be auto-merged");
          clearGuestSession();
        }

        // ========== CART RESTORATION ==========
        const shopifyCartId = data?.data?.user?.shopifyCartId;
        console.log("[DEBUG] ========== CART RESTORATION (BottomSheet) ==========");
        console.log("[DEBUG] shopifyCartId from login response:", shopifyCartId);

        if (shopifyCartId) {
          console.log("[DEBUG] Found shopifyCartId, attempting to restore cart...");
          try {
            const { syncWithApiResponse } = useCartStore.getState();
            const encodedCartId = encodeURIComponent(shopifyCartId);
            console.log("[DEBUG] Fetching cart with encoded ID:", encodedCartId);

            const cartResponse = await getCart(encodedCartId);
            console.log("[DEBUG] Cart API response:", JSON.stringify(cartResponse?.data, null, 2));

            if (cartResponse?.data?.items && cartResponse.data.items.length > 0) {
              const convertedItems = cartResponse.data.items.map((item: any) => ({
                lineItemId: item.id,
                productId: item.productId?.replace("gid://shopify/Product/", "") || "",
                variantId: item.merchandiseId?.replace("gid://shopify/ProductVariant/", "") || "",
                merchandiseId: item.merchandiseId || "",
                quantity: item.quantity || 1,
                title: item.title || "",
                variantTitle: item.variantTitle || "",
                price: typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0),
                compareAtPrice: item.compareAtPrice
                  ? (typeof item.compareAtPrice === "string" ? parseFloat(item.compareAtPrice) : item.compareAtPrice)
                  : null,
                image: item.image || null,
                currency: item.currency || "USD",
                quantityAvailable: item.quantityAvailable || 99,
                metafields: item.metafields || [],
                selectedOptions: item.selectedOptions || [],
                brandName: item.brandName || undefined,
              }));

              syncWithApiResponse({
                cartId: shopifyCartId,
                items: convertedItems,
              });

              console.log("[DEBUG] ✅ Cart restored successfully:", convertedItems.length, "items");
            } else {
              console.log("[DEBUG] Cart response had no items");
            }
          } catch (error) {
            console.log("[DEBUG] ❌ Cart restoration error:", error);
            // Don't crash - just continue with empty cart
          }
        } else {
          console.log("[DEBUG] No shopifyCartId in response - skipping cart restoration");
        }
        console.log("[DEBUG] ========== CART RESTORATION COMPLETE ==========");
        // ========== END CART RESTORATION ==========

        // Dismiss the bottom sheet
        bottomSheetRef.current?.dismiss();

        // Call success callback
        onLoginSuccess?.();
      },
    });

    const form = useForm<LoginForm>({
      defaultValues: {
        email: "",
        password: "",
      },
    });

    const onSubmit = async (data: LoginForm) => {
      Keyboard.dismiss();
      try {
        await loginUser(data);
      } catch (error: any) {
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Login failed. Please try again."
        );
      }
    };

    const googleLogin = async () => {
      // TODO: Implement Google Login
    };

    const handleSignUpPress = () => {
      // Navigate first, then dismiss the modal after a short delay
      // This prevents the visual jerk between modal close and screen push
      onSignUpPress?.();
      setTimeout(() => {
        bottomSheetRef.current?.dismiss();
      }, 100);
    };

    useImperativeHandle(ref, () => ({
      present: () => {
        form.reset();
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const handleDismiss = useCallback(() => {
      form.reset();
      onDismiss?.();
    }, [form, onDismiss]);

    return (
      <BaseBottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing={false}
        snapPoints={["90%"]}
        showBackdrop={true}
        onDismiss={handleDismiss}
        enablePanDownToClose={true}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: BOTTOM_INSET + 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack paddingHorizontal={"$md"}>
            <Spacer size={"$md"} />

            {/* Header */}
            <YStack alignItems="center">
              <YStack
                shadowColor={"$primary"}
                shadowOffset={{ width: 0, height: 10 }}
                shadowOpacity={0.2}
                shadowRadius={4}
                backgroundColor="transparent"
              >
                <AppImage
                  tintColor={"$primary"}
                  name={"bagSvg"}
                  width={40}
                  height={45}
                />
              </YStack>
              <Spacer size={"$md"} />
              <HeadingSMBold>{t("auth.login.title")}</HeadingSMBold>
              <Spacer size={"$xs"} />
              <ParagraphMD color="$secondary" textAlign="center">
                Sign in to continue shopping
              </ParagraphMD>
            </YStack>

            <Spacer size={"$xl"} />

            {/* Form Fields */}
            <YStack width="100%">
              <TextSMSemiBold>{t("auth.login.email")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="email"
                control={form.control}
                rules={{
                  required: t("validation.emailRequired"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t("validation.emailInvalid"),
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={t("auth.login.emailPlaceholder")}
                    icon={<AppImage name="emailIcon" size={16} />}
                    error={fieldState.error?.message}
                    keyboardType="email-address"
                    onSubmitEditing={() => form.setFocus("password")}
                    autoCapitalize="none"
                  />
                )}
              />
              <Spacer size={"$lg"} />
              <TextSMSemiBold>{t("auth.login.password")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="password"
                control={form.control}
                rules={{
                  required: t("validation.passwordRequired"),
                  minLength: {
                    value: 6,
                    message: t("validation.passwordMinLength"),
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={t("auth.login.passwordPlaceholder")}
                    icon={<AppImage name="lockIcon" size={16} />}
                    secureTextEntry
                    error={fieldState.error?.message}
                    onSubmitEditing={form.handleSubmit(onSubmit)}
                    autoCapitalize="none"
                  />
                )}
              />
            </YStack>

            <Spacer size={"$md"} />

            {/* Remember Me */}
            <XStack onPress={() => setIsChecked(!isChecked)} alignItems="center">
              {isChecked ? (
                <YStack
                  alignItems="center"
                  justifyContent="center"
                  width={16}
                  height={16}
                  borderRadius={"$full"}
                  backgroundColor={getTokenValue("$primary")}
                >
                  <AppImage
                    tintColor={getTokenValue("$white")}
                    name={"check"}
                    width={8}
                    height={8}
                  />
                </YStack>
              ) : (
                <YStack
                  alignItems="center"
                  justifyContent="center"
                  width={getTokenValue("$md")}
                  height={getTokenValue("$md")}
                  borderRadius={"$full"}
                  borderWidth={1}
                />
              )}
              <Spacer size={"$xs-sm"} />
              <TextMDMedium>{t("auth.login.rememberMe")}</TextMDMedium>
            </XStack>

            <Spacer size={"$lg"} />

            {/* Login Button */}
            <PrimaryButton
              onPress={form.handleSubmit(onSubmit)}
              isLoading={isLoggingIn}
              label={t("common.login")}
            />

            <Spacer size={"$md"} />

            {/* Divider */}
            <XStack alignItems="center" gap={"$xs"}>
              <YStack
                alignItems="center"
                height={1}
                backgroundColor={"$lightgrey"}
                flex={1}
              />
              <Spacer size={"$reg"} />
              <ParagraphMD>{t("common.or")}</ParagraphMD>
              <Spacer size={"$reg"} />
              <YStack
                alignItems="center"
                height={1}
                backgroundColor={"$lightgrey"}
                flex={1}
              />
            </XStack>

            <Spacer size={"$md"} />

            {/* Google Sign In */}
            <OpTouch
              justifyContent="center"
              alignItems="center"
              backgroundColor={"white"}
              shadowColor={"black"}
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.05}
              style={{ elevation: 1, ...SHADOW_STYLES }}
              shadowRadius={16}
              borderRadius={"full"}
              paddingHorizontal={"md"}
              paddingVertical={"reg"}
              disabled={isLoggingIn}
              onPress={googleLogin}
            >
              <XStack alignItems="center">
                <AppImage name="googleIcon" size={23.5} />
                <Spacer size={"$reg"} />
                <TextMDSemiBold color={"$black"}>
                  {t("auth.login.signInWithGoogle")}
                </TextMDSemiBold>
              </XStack>
            </OpTouch>

            <Spacer size={"$xl"} />

            {/* Create Account Link */}
            <XStack justifyContent="center" alignItems="center">
              <ParagraphMD color="$secondary">Don't have an account? </ParagraphMD>
              <OpTouch onPress={handleSignUpPress} disabled={isLoggingIn}>
                <TextMDSemiBold color={"$primary"}>
                  {t("auth.login.createNewAccount")}
                </TextMDSemiBold>
              </OpTouch>
            </XStack>

            <Spacer size={"$md"} />
          </YStack>
        </BottomSheetScrollView>
      </BaseBottomSheetModal>
    );
  }
);

LoginBottomSheet.displayName = "LoginBottomSheet";
