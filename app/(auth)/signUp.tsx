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
        console.log('[SignUp] Guest session detected, cart will be auto-merged by backend');
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
            <AppImage
              tintColor={"$primary"}
              name={"bag"}
              width={47}
              height={53}
            />
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
