import { TextMDSemiBold, TextSMRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getTokenValue } from "tamagui";

export default function TabLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, paddingBottom: Platform.OS === "android" ? 0 : 0 }}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: getTokenValue("$primary"),
          headerShown: false,
          tabBarShowLabel: true,

          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
              backgroundColor: getTokenValue("$background"),
            },
            android: {
              backgroundColor: getTokenValue("$background"),
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
                name="homeTab"
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

            headerShown: true,
            headerTitle: () => <TextMDSemiBold>{"Cart"}</TextMDSemiBold>,
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: getTokenValue("$background"),
            },
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
            // headerShown: true,
            // headerTitle: () => <TextMDSemiBold>{"Wishlist"}</TextMDSemiBold>,

            // headerStyle: {
            //   backgroundColor: getTokenValue("$background"),
            // },
            tabBarLabel: ({ focused }) => (
              <TextSMRegular color={focused ? "$primary" : "$icon"}>
                {"Wishlist"}
              </TextSMRegular>
            ),
            tabBarIcon: ({ color, focused }) => (
              <AppImage
                tintColor={focused ? color : getTokenValue("$icon")}
                name="wishlistTab"
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
                // name="profileTab"
                name="profileTab"
                width={22}
                height={22}
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
