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
        options={({ route }) => {
          // Use collectionTitle from API if available, otherwise fallback to categoryName or "Products"
          const collectionTitle = (route.params as any)?.collectionTitle;
          const categoryName = (route.params as any)?.categoryName || "Products";
          const titleToShow = collectionTitle || categoryName;

          return {
          headerShown: true,
          headerTitle: () => (
            <CustomHeaderTitle
              title={titleToShow}
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
        };
        }}
      />
      <Stack.Screen
        name="[id]"
        options={() => ({
          headerShown: false,
        })}
      />
    </Stack>
  );
};

export default ProductsLayout;
