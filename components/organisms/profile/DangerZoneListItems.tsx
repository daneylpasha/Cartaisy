import Icons from "@/assets/Icons";
import { Spacer } from "@/components/atoms/Spacer";
import { GeneralCard } from "@/components/molecules/profile/GeneralCard";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import useAuthStore from "@/store/useAuthStore";
import useUserStore from "@/store/useUserStore";

import { YStack } from "tamagui";
import CloseAccountModal from "./CloseAccountModal";
import SignoutAccountModal from "./SignoutAccountModal";
import { useDeleteAccount } from "@/api/generated/authentication/authentication";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const DangerZoneListItem = () => {
  const [show, setShow] = useState(false);
  const [signout, setSignout] = useState(false);
  const [password, setPassword] = useState("");
  const { clearAuth } = useAuthStore();
  const { clearUser } = useUserStore();
  const queryClient = useQueryClient();

  // Delete account mutation
  const { mutate: deleteAccountMutation, isPending: isDeletingAccount } = useDeleteAccount({
    mutation: {
      onSuccess: () => {
        console.log("[DeleteAccount] Account deleted successfully");
        clearAuth();
        clearUser();
        queryClient.clear(); // Clear all cached data
        setShow(false);
        router.replace("/(auth)/login");
      },
      onError: (error: any) => {
        console.error("[DeleteAccount] Failed to delete account:", error);
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Failed to delete account. Please check your password and try again."
        );
      },
    },
  });
  const DATA = [
    {
      id: 1,
      image: "trash" as keyof typeof Icons,
      title: "Close Account",
      subtitle: "Contact information and password",
      onPress: () => {
        setShow(true);
      },
    },
    {
      id: 2,
      image: "signout" as keyof typeof Icons,
      title: "Sign Out",
      onPress: () => {
        setSignout(true);
      },
    },
  ];
  return (
    <YStack paddingHorizontal="$md">
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <GeneralCard {...item} onPress={item.onPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
        showsVerticalScrollIndicator={false}
      />
      <CloseAccountModal
        visible={show}
        expectedName="John Doe"
        loading={isDeletingAccount}
        onConfirm={(password) => {
          console.log("[DeleteAccount] Confirming account deletion");
          deleteAccountMutation({
            data: {
              password: password,
            },
          });
        }}
        onCancel={() => setShow(false)}
      />
      <SignoutAccountModal
        visible={signout}
        expectedName="John Doe"
        onConfirm={() => {
          console.log("[SignOut] Clearing auth and user data...");
          clearAuth();
          clearUser();
          setSignout(false);
          console.log("[SignOut] Redirecting to login...");
          router.replace("/(auth)/login");
        }}
        onCancel={() => setSignout(false)}
      />
    </YStack>
  );
};
