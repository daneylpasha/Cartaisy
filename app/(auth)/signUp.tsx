import { useSignUp } from "@/api/hooks/useAuth";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingSMBold } from "@/components/atoms/texts/HeadingSMBold";
import { TextMDSemiBold } from "@/components/atoms/texts/TextMDSemiBold";
import { TextSMSemiBold } from "@/components/atoms/texts/TextSMSemiBold";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import useAuthStore from "@/store/useAuthStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import useUserStore from "@/store/useUserStore";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTokenValue, XStack, YStack } from "tamagui";
import PasswordStrengthBar from "./components/PasswordStrengthBar";

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const { setToken, guestSessionId, clearGuestSession } = useAuthStore();
  const { setUser } = useUserStore();

  // Runtime branding (PR #104's data layer) — both are already validated
  // (hex color, HTTPS-only logo URL) before they land in the store, so no
  // extra validation is needed here beyond checking logoUrl is non-empty.
  // Absent in either case falls back to today's exact bundled appearance.
  const primaryColor = useStoreConfigStore((state) => state.primaryColor);
  const logoUrl = useStoreConfigStore((state) => state.logoUrl);
  const hasLogoUrl = Boolean(logoUrl && logoUrl.trim());

  const { mutateAsync: signUpUser, isPending: isSigningUp } = useSignUp({
    onSuccess: (data) => {
      console.log(" Sign Up Success! Full Response", data);

      // Now properly extract token - might be in data.token
      const token = data?.data?.token;

      const refreshToken = data?.data?.refreshToken;

      if (token) {
        setToken(token, refreshToken || undefined);
      } else {
        console.log("❌ No token found in registration response");
      }

      if (data?.data?.user) {
        setUser(data.data.user);
      }

      // If there was a guest session, show merge notification
      // Backend automatically merges guest cart when X-Session-ID header is present
      if (guestSessionId) {
        console.log(
          "[SignUp] Guest session detected, cart will be auto-merged by backend"
        );
        Alert.alert(
          "Account Created!",
          "Your cart has been saved to your new account.",
          [{ text: "OK" }]
        );
        // Clear guest session after successful signup (backend has already merged)
        clearGuestSession();
      }

      // Use replace to prevent double navigation from splash screen
      router.replace("/fullName");
    },
    onError: (error) => {
      console.log("❌ Sign Up Failed! Full Error:", error);
    },
  });

  const form = useForm<SignUpForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUpUser({
        email: data.email,
        password: data.password,
      });
      // Success is handled in the custom onSuccess handler
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Sign Up failed. Please try again."
      );
    }
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
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        {/* Back Button */}
        <XStack paddingHorizontal={"$md"} paddingTop={"$md"}>
          <OpTouch
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppImage
              name={"arrowBack"}
              size={20}
              tintColor={getTokenValue("$secondary")}
            />
          </OpTouch>
        </XStack>
        <Spacer size={"$md"} />
        <YStack paddingHorizontal={"$md"} alignItems="center">
          <YStack
            shadowColor={"$primary"}
            shadowOffset={{ width: 0, height: 10 }}
            shadowOpacity={0.2}
            shadowRadius={4}
            backgroundColor="transparent"
          >
            {hasLogoUrl ? (
              // Distinct `key`s on these two branches are load-bearing, not
              // decorative: without them, React treats both branches as the
              // same <AppImage> element at this position and reuses the
              // existing instance (and its state) when logoUrl arrives
              // asynchronously after mount (e.g. from AppInitializer's
              // startup fetch, which resolves after this screen has already
              // rendered the bundled logo). That reused instance's
              // `isLoading` state is still `false` from its initial
              // bundled-icon render, so the first render with the new
              // `source` prop has no fallback overlay and briefly shows a
              // blank/unloaded image until AppImage's own effect catches up
              // on a subsequent render. A `key` forces a full remount on
              // that transition instead, so the new instance's `isLoading`
              // initializes correctly (via its own
              // useState(!!isRemoteSource)) from its very first render — the
              // bundled logo stays visible with no gap. Same fix as
              // app/splash.tsx (PR #107) and HomeHeader.tsx (PR #108).
              //
              // No tintColor here: a merchant's uploaded logo is likely
              // multi-color, and tinting would flatten it into a solid
              // silhouette. Only the bundled fallback below keeps a tint.
              <AppImage
                key="runtime-logo"
                source={logoUrl}
                fallbackName="cartaisyColorlogo"
                width={107}
                height={53}
              />
            ) : (
              <AppImage
                key="bundled-logo"
                tintColor={primaryColor || "$primary"}
                name={"cartaisyColorlogo"}
                width={107}
                height={53}
              />
            )}
          </YStack>

          <Spacer size={"$lg"} />
          <HeadingSMBold>{t("auth.signup.title")}</HeadingSMBold>
          <Spacer size={"$2xl"} />

          <YStack width="100%">
            <TextSMSemiBold>{t("auth.signup.email")}</TextSMSemiBold>
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
                  placeholder={t("auth.signup.emailPlaceholder")}
                  icon={<AppImage name="emailIcon" size={16} />}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  onSubmitEditing={() => form.setFocus("password")}
                  autoCapitalize="none"
                />
              )}
            />
            <Spacer size={"$lg"} />
            <TextSMSemiBold>{t("auth.signup.password")}</TextSMSemiBold>
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
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  icon={<AppImage name="lockIcon" size={16} />}
                  secureTextEntry
                  error={fieldState.error?.message}
                  onSubmitEditing={form.handleSubmit(onSubmit)}
                  autoCapitalize="none"
                />
              )}
            />
            <Spacer size={"$sm"} />
            <PasswordStrengthBar password={form.watch("password")} />
            <Spacer size={"$lg"} />
            <TextSMSemiBold>{t("auth.signup.confirmPassword")}</TextSMSemiBold>
            <Spacer size={"$sm"} />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                  icon={<AppImage name="lockIcon" size={16} />}
                  secureTextEntry
                  error={fieldState.error?.message}
                  // onSubmitEditing={form.handleSubmit(onSubmit)}
                  autoCapitalize="none"
                />
              )}
            />
          </YStack>
        </YStack>
        <Spacer size={"$3xl"} />
        <YStack paddingHorizontal={"$md"}>
          <PrimaryButton
            onPress={form.handleSubmit(onSubmit)}
            isLoading={isSigningUp}
            label={t("common.createAccount")}
          />
        </YStack>
        <Spacer size={"$3xl"} />
        <OpTouch
          justifyContent="center"
          alignItems="center"
          disabled={isSigningUp}
          // onPress={() => router.push("/(auth)/login")}
          onPress={() => router.push("/(tabs)")}
        >
          <TextMDSemiBold
            borderBottomWidth={1}
            color={"$primary"}
            borderBottomColor={"$primary"}
          >
            {t("auth.signup.alreadyHaveAccount")}
          </TextMDSemiBold>
        </OpTouch>
        <Spacer size={"$lg"} />
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default SignUp;
