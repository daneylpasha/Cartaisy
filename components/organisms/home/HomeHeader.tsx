import { TextSMSemiBold, TextXSRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { useCompanyName } from "@/hooks/useCompanyName";
import useCartStore from "@/store/useCartStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import useUserStore from "@/store/useUserStore";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import React from "react";
import { Animated, Platform } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

type HomeHeaderProps = {
  topInset: number;
  rotateAnim: Animated.Value;
  onAddressPress: () => void;
};

export const HomeHeader = ({
  topInset,
  rotateAnim,
  onAddressPress,
}: HomeHeaderProps) => {
  const { items, getTotalQuantity } = useCartStore();
  const { defaultAddress } = useUserStore();
  const cartItemCount = getTotalQuantity();

  // Runtime branding (PR #104's data layer) — both are already validated
  // (hex color, HTTPS-only logo URL) before they land in the store, so no
  // extra validation is needed here beyond checking logoUrl is non-empty.
  // Absent in either case falls back to today's exact bundled appearance.
  const primaryColor = useStoreConfigStore((state) => state.primaryColor);
  const logoUrl = useStoreConfigStore((state) => state.logoUrl);
  const hasLogoUrl = Boolean(logoUrl && logoUrl.trim());
  const companyName = useCompanyName();

  // Format default address for display
  const displayAddress = defaultAddress
    ? [
        defaultAddress.address1,
        defaultAddress.city,
        defaultAddress.province,
        defaultAddress.zip,
      ]
        .filter(Boolean)
        .join(", ")
    : "Add delivery address";

  return (
    <YStack
      paddingTop={Platform.OS === "android" ? 10 : 0}
      paddingHorizontal="$md"
      backgroundColor={primaryColor || "$primary"}
      paddingBottom={"$md"}
    >
      <XStack
        alignItems="center"
        justifyContent="center"
        paddingVertical={"$xs"}
        minHeight={32}
        position="relative"
      >
        <YStack position="absolute" left={0} right={0} alignItems="center">
          {hasLogoUrl ? (
            // Distinct `key`s on these two branches are load-bearing, not
            // decorative: without them, React treats both branches as the
            // same <AppImage> element at this position and reuses the
            // existing instance (and its state) when logoUrl arrives
            // asynchronously after mount (e.g. from AppInitializer's
            // startup fetch, which resolves after this header has already
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
            // app/splash.tsx (PR #107).
            <AppImage
              key="runtime-logo"
              source={logoUrl}
              fallbackName="cartaisyWhitelogo"
              width={75}
              height={26}
            />
          ) : (
            <AppImage
              key="bundled-logo"
              name="cartaisyWhitelogo"
              width={75}
              height={26}
            />
          )}
        </YStack>

        <YStack position="absolute" right={0}>
          <OpTouch onPress={() => router.push("/cart")}>
            <YStack position="relative">
              <AppImage name="cartIcon" size={24} />
              {cartItemCount > 0 && (
                <YStack
                  position="absolute"
                  backgroundColor="$white"
                  top={-8}
                  right={-10}
                  borderRadius="$full"
                  minWidth={20}
                  height={20}
                  justifyContent="center"
                  alignItems="center"
                  paddingHorizontal={"$xs"}
                >
                  <TextXSRegular color="$darkgrey" textAlign="center">
                    {String(cartItemCount)}
                  </TextXSRegular>
                </YStack>
              )}
            </YStack>
          </OpTouch>
        </YStack>
      </XStack>
      <Spacer size={"$md"} />

      {/* Search Bar */}
      <YStack
        backgroundColor="$white"
        borderRadius={tokens.radius.md}
        paddingVertical={"$reg"}
        paddingHorizontal={"$reg"}
        // padding={"$sm-reg"}
      >
        <OpTouch
          activeOpacity={0.9}
          onPress={() => router.push("/search")}
          hitSlop={10}
        >
          <XStack alignItems="center" gap={"$md"} flexShrink={1}>
            <AppImage
              name="searchIcon"
              width={18}
              height={18}
              tintColor="$secondary"
            />

            <TextMDRegular
              color="$textgrey"
              flexShrink={1}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {companyName ? `Search ${companyName}` : "Search"}
            </TextMDRegular>
          </XStack>
        </OpTouch>
      </YStack>
      <Spacer size={"$sm"} />

      {/* Address Selector */}
      <OpTouch
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={onAddressPress}
      >
        <XStack justifyContent="space-between" alignItems="center" gap="$sm">
          <XStack alignItems="center" gap={"$xs"} flex={1} flexShrink={1}>
            <AppImage
              tintColor={getTokenValue("$white")}
              name="locationIcon"
              width={13}
              height={17}
            />
            <Spacer size={"$sm"} />
            <TextSMSemiBold
              color="$white"
              numberOfLines={1}
              ellipsizeMode="tail"
              flexShrink={1}
            >
              {displayAddress}
            </TextSMSemiBold>
          </XStack>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <AppImage
              tintColor={getTokenValue("$white")}
              name="arrowUp"
              width={13}
              height={7.5}
            />
          </Animated.View>
        </XStack>
      </OpTouch>
    </YStack>
  );
};
