import {
  ParagraphMD,
  TextLGBold,
  TextMDSemiBold,
  TextSMRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native-gesture-handler";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";
import { PrimaryButton, SecondaryButton } from "../buttons";

import Icons from "@/assets/Icons";
import { t } from "@/translations";
import {
  GRID_COLUMN_GAP,
  GRID_SIDE_PADDING,
  ProductCard,
} from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
type IconName = keyof typeof Icons;

type Product = {
  id: string;
  price: number;
  image: IconName[];
  title: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  progressValue: number;
  showProgressBar: boolean;
  ratingValue: number;
  totalReviewCount: number;
  wishlist: boolean;
  discountBadge: boolean;
};
const products: Product[] = [
  {
    id: "1",
    price: 100,
    image: ["product1"],
    title: "Bose QuietComfort Bluetooth Headphones - Chilled Lilac",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "2",
    price: 100,
    image: ["product2"],
    title: "Product2",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "3",
    price: 100,
    image: ["product3"],
    title: "Product3",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "4",
    price: 100,
    image: ["product4"],
    title: "Product4",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "5",
    price: 100,
    image: ["product5"],
    title: "Product5",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 0,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
];
export const CheckoutSuccess = () => {
  const imageData = ["product1", "productForyou2", "productForyou1"];
  return (
    <YStack alignItems="center">
      <Spacer size={"$lg"} />
      <YStack
        width={48}
        height={48}
        borderRadius="$full"
        backgroundColor="$green"
        alignItems="center"
        justifyContent="center"
      >
        <AppImage
          name="check"
          width={19}
          height={14}
          tintColor={getTokenValue("$white")}
        />
      </YStack>
      <Spacer size={"$xl"} />
      {/* Product Images */}
      <XStack gap="$sm" alignItems="center">
        {imageData.map((item, index) => (
          <YStack
            key={index}
            borderRadius="$md"
            overflow="hidden"
            borderWidth={1}
            borderColor={"$lightgrey"}
            backgroundColor="$background"
            padding="$xs"
          >
            <AppImage name={item as any} width={56} height={56} />
          </YStack>
        ))}
      </XStack>
      <Spacer size={"$md-lg"} />
      {/* Success Message */}
      <TextLGBold textAlign="center">Checkout Successful.</TextLGBold>
      <Spacer size={"$sm"} />
      <ParagraphMD color="$secondary" textAlign="center">
        {"You just saved $25.00 compared to other e-commerce apps"}
      </ParagraphMD>
      <Spacer size={"$md-lg"} />
      {/* Order Details */}
      <XStack alignItems="center">
        <TextSMRegular color="$secondary">{"$13.25"}</TextSMRegular>
        <Spacer size={"$sm"} />
        <YStack
          width={4}
          height={4}
          borderRadius="$full"
          backgroundColor="$lightgrey"
        />
        <Spacer size={"$sm"} />
        <TextSMRegular color="$secondary">
          {"Order #1157lg5748411"}
        </TextSMRegular>
      </XStack>
      <Spacer size={"$xl"} />
      {/* Action Buttons */}
      <YStack width="100%" paddingHorizontal={"$md"}>
        <PrimaryButton
          label="See My Orders"
          onPress={() => router.push("/orders")}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          label="See Order Status"
          onPress={() => router.push("/ordersDetails")}
        />
      </YStack>

      <Spacer size="$lg" />

      {/* Help Option */}
      <OpTouch onPress={() => {}}>
        <XStack alignItems="center" gap="$xs">
          <AppImage
            name="warningIcon"
            width={16}
            height={16}
            tintColor={getTokenValue("$primary")}
          />
          <TextMDSemiBold color="$primary">
            {"I need help with this"}
          </TextMDSemiBold>
        </XStack>
      </OpTouch>
      <YStack>
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("home.sectionHeader.youMightAlsoLike")}
          image={"bulb"}
          tintColor={"darkgrey"}
          seeAllText="View All"
          color="primary"
          onPressSeeAll={() => {}}
        />

        <Spacer size={"$reg"} />
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item as any}
              context="grid"
              showProgressBar={false}
            />
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{
            paddingHorizontal: GRID_SIDE_PADDING,
            gap: GRID_COLUMN_GAP,
          }}
        />
      </YStack>
    </YStack>
  );
};
