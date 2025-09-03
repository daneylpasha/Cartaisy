import { HEADER_CONFIGS } from "@/constants/headers";
import { Stack } from "expo-router";
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
      <Stack.Screen
        name="forgotPassword"
        options={HEADER_CONFIGS.forgotPassword}
      />
      <Stack.Screen name="passwordResetSent" />
    </Stack>
  );
}
