import {
  ParagraphMD,
  TextMDBold,
  TextMDSemiBold,
  TextSMMedium,
  TextSMRegular,
  TextSMSemiBold,
  TextXLBold,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import OrderTimeline from "@/components/molecules/orders/OrderTrackingTimeline";
import CancelOrderModal from "@/components/organisms/order-details/CancelOrderModal";
import { SHADOW_STYLES } from "@/constants/styles";
import { router } from "expo-router";

import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

const ordersDetails = () => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  // Animation refs
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 10
        );
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 30) {
          // Swipe down - close
          setOpen(false);
        } else if (gestureState.dy < -30) {
          // Swipe up - open
          setOpen(true);
        }
      },
    })
  ).current;

  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();
  useEffect(() => {
    if (open) {
      // Animate in
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [open, animatedHeight, animatedOpacity]);

  // Handle open state change with animation delay
  const toggleOrderSummary = () => {
    if (open) {
      // Start closing animation
      setOpen(false);
    } else {
      // Open immediately
      setOpen(true);
    }
  };

  return (
    <YStack flex={1} backgroundColor={"$background"}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Spacer size={"$lg"} />
        <YStack justifyContent="center" alignItems="center">
          <YStack
            width={64}
            height={64}
            borderRadius={"$md"}
            borderWidth={1}
            borderColor={"$lightgrey"}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            <AppImage name="product1" size={64} />
          </YStack>
          <Spacer size={"$lg"} />
          <XStack
            justifyContent="center"
            alignItems="center"
            paddingHorizontal={"$reg"}
            paddingVertical={"$xs"}
            borderRadius={"$3xl"}
            backgroundColor={"$secondary"}
          >
            <AppImage
              tintColor={getTokenValue("$white")}
              name="hourGlass"
              width={16}
              height={16}
            />
            <Spacer size={"$sm"} />
            <TextSMMedium color={"$white"}>{"In Progress"}</TextSMMedium>
          </XStack>
          <Spacer size={"$lg"} />
          <XStack alignItems="center" justifyContent="center">
            <TextSMRegular> {"Qty: 1"}</TextSMRegular>
            <Spacer size={"$reg"} />
            <YStack
              width={4}
              height={4}
              backgroundColor={"$lightgrey"}
              borderRadius={"$full"}
            />
            <Spacer size={"$reg"} />
            <TextSMRegular> {"Order #115574487"}</TextSMRegular>
          </XStack>
          <Spacer size={"$reg"} />
          <TextXLBold textAlign="center">
            {"Women's Faux Leather Skirt - High-Waisted and Flattering"}
          </TextXLBold>
          <Spacer size={"$reg"} />
          <TextSMRegular>{"Oder Mar 23, 2025"}</TextSMRegular>
          <Spacer size={"$reg"} />
          <TextSMRegular>{"Arriving March 25 - March 29"}</TextSMRegular>
        </YStack>
        <Spacer size={"$xl"} />
        <YStack paddingHorizontal={"$md"}>
          <TextMDBold>{"Timeline"}</TextMDBold>
          <Spacer size={"$lg"} />
          <OrderTimeline />
          <Spacer size={"$lg"} />
          <TextMDBold>{"Shipping Info"}</TextMDBold>
          <Spacer size={"$reg"} />
          <YStack>
            <YStack
              style={{
                ...SHADOW_STYLES,
              }}
              backgroundColor="$white"
              borderRadius="$2xl"
              padding="$reg"
            >
              <XStack>
                <XStack alignItems="center">
                  <YStack
                    backgroundColor={"$background"}
                    borderRadius={"$full"}
                    width={48}
                    height={48}
                    justifyContent="center"
                    alignItems="center"
                    marginTop={-10}
                  >
                    <AppImage name="upsIcon" width={43} height={43} />
                  </YStack>
                  <Spacer size={"$reg"} />
                  <YStack>
                    <TextMDBold>{"Standard Shipping"}</TextMDBold>
                    <Spacer size={"$xs"} />
                    <TextSMRegular>
                      {"Estimated Delivery: 5-7 days"}
                    </TextSMRegular>
                    <Spacer size={"$xs-sm"} />
                    <TextXSRegular color="$secondary">
                      {"Cost: $5 or free for orders over $50"}
                    </TextXSRegular>
                  </YStack>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
          <Spacer size={"$md-lg"} />
          <SecondaryButton label="Track order" onPress={() => {}} />
          <Spacer size={"$xl"} />
          <TextMDBold>{"Address Info"}</TextMDBold>
          <Spacer size={"$reg"} />
          <OpTouch style={[{ ...SHADOW_STYLES }]}>
            <XStack
              backgroundColor={"$white"}
              borderRadius="$2xl"
              padding={"$reg"}
              justifyContent="space-between"
            >
              <XStack>
                <AppImage
                  name="locationUnfilled"
                  tintColor={getTokenValue("$primary")}
                  width={16}
                  height={20}
                />
                <Spacer size={"$reg"} />
                <YStack width={"80%"}>
                  <TextMDSemiBold>{"James Vermillion"}</TextMDSemiBold>
                  <Spacer size={"$sm"} />
                  <ParagraphSM color="$secondary">
                    {
                      "18752 January Avenue, North Manhattan, New York, NY, 10013"
                    }
                  </ParagraphSM>
                  <Spacer size={"$sm"} />
                  <XStack alignItems="center">
                    <YStack
                      justifyContent="center"
                      alignItems="center"
                      width={14}
                      height={14}
                      borderRadius="$full"
                      backgroundColor="$green"
                    >
                      <AppImage
                        name="check"
                        tintColor={getTokenValue("$white")}
                        width={7}
                        height={7}
                      />
                    </YStack>
                    <Spacer size={"$xs"} />
                    <TextXSRegular>{"Shipping Available"}</TextXSRegular>
                  </XStack>
                </YStack>
              </XStack>
            </XStack>
          </OpTouch>
        </YStack>
        <Spacer size={"$md"} />
      </ScrollView>
      <YStack paddingHorizontal={"$md"}>
        <YStack>
          <Animated.View
            style={{
              opacity: animatedOpacity,

              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300], // Adjust this value based on your content height
              }),
              overflow: "hidden",
            }}
          >
            <Spacer size={"$sm"} />
            <Animated.View {...panResponder.panHandlers}>
              <YStack
                justifyContent="center"
                alignItems="center"
                width={40}
                height={20}
                alignSelf="center"
                paddingVertical={8}
              >
                <YStack
                  width={40}
                  height={4}
                  backgroundColor={"$icon"}
                  borderRadius={"$2xl"}
                />
              </YStack>
            </Animated.View>
            <Spacer size={"$sm"} />
            <TextMDBold>{"Payment Summary"}</TextMDBold>
            <Spacer size={"$reg"} />
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMSemiBold>{"Subtotal ( Items )"}</TextSMSemiBold>
              <TextSMSemiBold>${"4,211"}</TextSMSemiBold>
            </XStack>
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMRegular color="$secondary">{"Discount"}</TextSMRegular>
              <TextSMSemiBold color="$green">${"2323"}</TextSMSemiBold>
            </XStack>
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMRegular color="$secondary">
                {"Coupon Discount"}
              </TextSMRegular>
              <TextSMSemiBold color="$green">${"2323"}</TextSMSemiBold>
            </XStack>
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMRegular color="$secondary">{"Taxes"}</TextSMRegular>
              <TextSMSemiBold color="$error">{"$23.00"}</TextSMSemiBold>
            </XStack>
            <XStack paddingVertical={"$sm"} justifyContent="space-between">
              <TextSMRegular color="$secondary">{"Delivery Fee"}</TextSMRegular>
              <TextSMSemiBold color="$error">{"$8.00"}</TextSMSemiBold>
            </XStack>
            <Spacer size={"$md"} />
          </Animated.View>

          <Divider />
          <Spacer size={"$sm"} />
          <OpTouch onPress={toggleOrderSummary}>
            <XStack justifyContent="space-between">
              <TextSMSemiBold>{"GrandTotal"}</TextSMSemiBold>
              <XStack alignItems="center">
                <TextMDBold>{"$4101"}</TextMDBold>
                <Spacer size={"$xs"} />
                <AppImage
                  name="caretRight"
                  width={14}
                  height={14}
                  style={{
                    transform: [
                      {
                        rotate: open ? "-90deg" : "90deg",
                      },
                    ],
                  }}
                />
              </XStack>
            </XStack>
          </OpTouch>
          <Spacer size={"$md"} />
        </YStack>
        <PrimaryButton
          label={"I need help with this order"}
          onPress={() => {}}
          isLoading={false}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          onPress={() => setShow(true)}
          label={"Cancel Order"}
        />
        <Spacer size={bottomSafeAreaInset} />
      </YStack>
      
      <CancelOrderModal
        visible={show}
        expectedName="John Doe"
        onConfirm={() => {
          router.push("/cancelOrder");
          setShow(false);
        }}
        onCancel={() => setShow(false)}
      />
    </YStack>
  );
};

export default ordersDetails;
