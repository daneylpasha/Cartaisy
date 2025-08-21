import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { CustomHeaderTitle } from "@/components/molecules/CustomHeaderTitle";
import { tokens } from "@/tamagui/token";
import { router, Stack } from "expo-router";
import React from "react";

const ProductsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={({ route }) => ({
          headerShown: true,
          headerTitle: () => (
            <CustomHeaderTitle
              title={(route.params as any)?.categoryName || "Products"}
            />
          ),
          headerTitleAlign: "center",
          headerLeft: () => (
            <OpTouch onPress={() => router.back()}>
              <AppImage name={"arrowBack"} size={16} />
            </OpTouch>
          ),
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: tokens.color.background,
          },
          headerTintColor: tokens.color.background,
        })}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          headerShown: false,
        })}
      />
    </Stack>
  );
};

export default ProductsLayout;
