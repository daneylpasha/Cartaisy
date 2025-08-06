import { TextSMRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { getTokenValue } from "tamagui";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getTokenValue("$primary"),
        headerShown: false,
        tabBarShowLabel: true,

        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: ({ focused }) => (
            <TextSMRegular color={focused ? "$primary" : "$icon"}>
              {"Home"}
            </TextSMRegular>
          ),
          tabBarIcon: ({ color, focused }) => (
            <AppImage
              tintColor={focused ? color : getTokenValue("$icon")}
              name="homeIcon"
              width={21}
              height={19}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarLabel: ({ focused }) => (
            <TextSMRegular color={focused ? "$primary" : "$icon"}>
              {"Cart"}
            </TextSMRegular>
          ),
          tabBarIcon: ({ color, focused }) => (
            <AppImage
              tintColor={focused ? color : getTokenValue("$icon")}
              name="cartFill"
              width={21}
              height={19}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarLabel: ({ focused }) => (
            <TextSMRegular color={focused ? "$primary" : "$icon"}>
              {"Wishlist"}
            </TextSMRegular>
          ),
          tabBarIcon: ({ color, focused }) => (
            <AppImage
              tintColor={focused ? color : getTokenValue("$icon")}
              name="wishlistIcon"
              width={21}
              height={19}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: ({ focused }) => (
            <TextSMRegular color={focused ? "$primary" : "$icon"}>
              {"Account"}
            </TextSMRegular>
          ),
          tabBarIcon: ({ color, focused }) => (
            <AppImage
              tintColor={focused ? color : getTokenValue("$icon")}
              name="userFill"
              width={21}
              height={19}
            />
          ),
        }}
      />
    </Tabs>
  );
}
