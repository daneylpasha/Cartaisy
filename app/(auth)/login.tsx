import { useLogin } from "@/api/hooks/useAuth";
import { getCart } from "@/api/generated/cart/cart";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import {
  HeadingSMBold,
  ParagraphMD,
  TextMDMedium,
  TextMDSemiBold,
  TextSMSemiBold,
} from "@/components/atoms/texts";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";
import { SHADOW_STYLES } from "@/constants/styles";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import useUserStore from "@/store/useUserStore";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTokenValue, XStack, YStack } from "tamagui";
type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const { setToken, setProfileComplete, guestSessionId, clearGuestSession } = useAuthStore();
  const { setUser } = useUserStore();

  const { mutateAsync: loginUser, isPending: isLoggingIn } = useLogin({
    onSuccess: async (data) => {
      console.log('[DEBUG] ========== LOGIN SUCCESS ==========');
      console.log('[DEBUG] Full login response:', JSON.stringify(data, null, 2));
      console.log('[DEBUG] User object:', JSON.stringify(data?.data?.user, null, 2));
      console.log('[Login] Token from response:', data?.data?.token ? 'EXISTS' : 'NULL');

      if (data?.data?.token) {
        console.log('[Login] Calling setToken...');
        setToken(data.data.token, data.data.refreshToken);
      } else {
        console.log('[Login] WARNING: No token in response!');
      }

      if (data?.data?.user) {
        setUser(data.data.user);
      }

      // Existing users logging in have completed their profile
      setProfileComplete(true);

      // If there was a guest session, show merge notification and clear it
      if (guestSessionId) {
        console.log('[Login] Guest session detected, cart will be auto-merged by backend');
        Alert.alert(
          "Welcome back!",
          "Your cart items have been saved to your account.",
          [{ text: "OK" }]
        );
        // Clear guest session after successful login (backend has already merged)
        clearGuestSession();
      }

      // Restore cart if customer has saved shopifyCartId
      const shopifyCartId = (data?.data?.user as any)?.shopifyCartId;
      console.log('[DEBUG] shopifyCartId from user:', shopifyCartId, 'type:', typeof shopifyCartId);

      if (shopifyCartId) {
        console.log("[DEBUG] Entering cart restoration block...");
        console.log("[Login] Found saved cartId, attempting to restore cart...");
        try {
          const { syncWithApiResponse } = useCartStore.getState();
          const cartResponse = await getCart(encodeURIComponent(shopifyCartId));

          if (cartResponse?.data?.items && cartResponse.data.items.length > 0) {
            // Convert API response to local cart format
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

            console.log("[Login] Cart restored successfully:", convertedItems.length, "items");
          } else {
            console.log("[Login] Saved cart was empty");
          }
        } catch (error) {
          // Cart might be expired in Shopify - that's okay, user starts fresh
          console.log("[Login] Could not restore cart (may be expired):", error);
        }
      } else {
        console.log("[DEBUG] No shopifyCartId in response - skipping cart restoration");
        console.log("[Login] No saved cartId found");
      }

      console.log('[DEBUG] ========== LOGIN COMPLETE ==========');
      router.replace("/(tabs)");
    },
    onError: (error) => {
      // Error handling is done in onSubmit
    },
  });

  const form = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
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
  return (
    <ScreenContainer backgroundColor={"background"}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        <Spacer size={"$xl"} />
        <YStack paddingHorizontal={"$md"} alignItems="center">
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
              width={47}
              height={53}
            />
          </YStack>

          <Spacer size={"$lg"} />
          <HeadingSMBold>{t("auth.login.title")}</HeadingSMBold>
          <Spacer size={"$2xl"} />

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
                />
              )}
            />
          </YStack>
        </YStack>
        <Spacer size={"$md"} />
        <YStack paddingHorizontal={"$md"}>
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
          <PrimaryButton
            onPress={form.handleSubmit(onSubmit)}
            isLoading={isLoggingIn}
            label={t("common.login")}
          />
          <Spacer size={"$reg"} />
          <SecondaryButton
            onPress={() => router.push("/(auth)/signUp")}
            label={t("auth.login.createNewAccount")}
          />

          <Spacer size={"$md"} />
          <XStack alignItems="center" gap={"$xs"}>
            <YStack
              alignItems="center"
              height={1}
              backgroundColor={"$lightgrey"}
              width={"42%"}
              gap={"$xs"}
            />
            <Spacer size={"$reg"} />
            <ParagraphMD>{t("common.or")}</ParagraphMD>
            <Spacer size={"$reg"} />
            <YStack
              alignItems="center"
              height={1}
              backgroundColor={"$lightgrey"}
              width={142}
              gap={"$xs"}
            />
          </XStack>

          <Spacer size={"$md"} />

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
          <Spacer size={"$2xl"} />
          <OpTouch
            justifyContent="center"
            alignItems="center"
            disabled={isLoggingIn}
            onPress={() => router.push("/(auth)/forgotPassword")}
          >
            <TextMDSemiBold
              borderBottomWidth={1}
              color={"$primary"}
              borderBottomColor={"$primary"}
            >
              {t("auth.login.forgotPassword")}
            </TextMDSemiBold>
          </OpTouch>
        </YStack>
        <Spacer size={"$lg"} />
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default Login;
