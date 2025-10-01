import Icons from "@/assets/Icons";
import {
  HeadingXSBold,
  TextMDBold,
  TextMDSemiBold,
  TextSMMedium,
  TextSMRegular,
  TextXLMedium,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import ProductCarousel from "@/components/molecules/product/pdp/ProductCarousel";
import ProductSpec from "@/components/molecules/product/pdp/ProductSpec";
import {
  GRID_COLUMN_GAP,
  GRID_SIDE_PADDING,
  ProductCard,
} from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { RatingStar } from "@/components/organisms/home";
import { t } from "@/translations";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import ImageViewing from "react-native-image-viewing";
import { getTokenValue, XStack, YStack } from "tamagui";

// ===== types =====
type IconName = keyof typeof Icons;

type Product = {
  id: string;
  price: number;
  image: IconName[]; // ALWAYS array
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
    image: ["product1", "product2", "product3", "product4", "product5"],
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

const productSpecs = [
  { label: "Brand", value: "Bose" },
  { label: "Color", value: "Chilled Lilac" },
  { label: "Ear Placement", value: "Over Ear" },
  { label: "Noise Control", value: "Active Noise Cancellation" },
  {
    label: "Model Name",
    value:
      "Bose QuietComfort Wireless Noise Cancelling Headphones, Bluetooth Over Ear Headphones with Up To 24 Hours",
  },
  { label: "Connectivity Technology", value: "Wireless" },
  { label: "Material", value: "Leather, Plastic" },
  { label: "Charging Time", value: "2.5 Hours" },
  { label: "Item Weight", value: "240 grams" },
];

const ProductDetailsScreen = () => {
  const { id, productData } = useLocalSearchParams<{ id: string; productData?: string }>();

  // ✅ Parse the product data from navigation params
  const passedProduct = productData ? JSON.parse(productData as string) : null;

  console.log("ID:", id);
  console.log("Passed Product Data:", passedProduct);

  // ✅ Use passed product data if available, otherwise fallback to local data
  const product = passedProduct || products.find((p) => p.id == id);

  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // ✅ Handle both single image and array of images from API
  const productImages = useMemo(() => {
    // Check if product from API has image/images
    if (passedProduct) {
      // If has images array
      if (passedProduct.images && Array.isArray(passedProduct.images)) {
        return passedProduct.images.map((img: any) =>
          typeof img === 'string' ? img : img.src || img.url || img
        );
      }
      // If has single image (not array)
      if (passedProduct.image) {
        // Convert single image to array
        return [passedProduct.image];
      }
    }

    // Fallback to local product.image array
    return product?.image ?? [];
  }, [passedProduct, product]);

  // ✅ Create proper image sources for ImageViewing
  const viewerImages = useMemo(() => {
    return productImages.map((img: string) => {
      // Check if it's a URL or an icon name
      if (img.startsWith('http') || img.startsWith('https')) {
        return { uri: img }; // API image URL
      }
      // Fallback to icon if it's a local icon name
      return Icons[img as keyof typeof Icons] || { uri: img };
    });
  }, [productImages]);

  // Define sections for FlatList
  const sections = [
    {
      id: "carousel",
      type: "carousel",
      content: (
        <ProductCarousel
          height={385}
          images={productImages}
          onImagePress={(i) => {
            setViewerIndex(i);
            setViewerOpen(true);
          }}
        />
      ),
    },
    {
      id: "productInfo",
      type: "productInfo",
      content: (
        <YStack paddingHorizontal="$md">
          <XStack alignItems="center">
            <XStack
              borderWidth={1}
              borderColor="$primary"
              paddingHorizontal={"$sm-reg"}
              paddingVertical={"$xs"}
              borderRadius={"$full"}
              alignItems="center"
              justifyContent="center"
            >
              <AppImage
                tintColor={getTokenValue("$primary")}
                name={"trophy"}
                width={15}
                height={12}
              />
              <Spacer size={"$xs-sm"} />
              <TextSMMedium color="$primary">{"Best Seller"}</TextSMMedium>
            </XStack>
            <Spacer size={"$sm"} />
            <XStack
              borderWidth={1}
              borderColor="$error"
              paddingHorizontal={"$sm-reg"}
              paddingVertical={"$xs"}
              borderRadius={"$full"}
              alignItems="center"
              justifyContent="center"
            >
              <AppImage
                tintColor={getTokenValue("$error")}
                name={"offerIcon"}
                width={14}
                height={10}
              />
              <Spacer size={"$xs-sm"} />
              <TextSMMedium color="$error">{"15 % OFF"}</TextSMMedium>
            </XStack>
          </XStack>

          <Spacer size={"$md"} />
          <TextXLMedium color="$text">{product?.title}</TextXLMedium>
          <Spacer size={"$reg"} />
          <TextSMRegular color="$secondary">
            {"187 sold this month"}
          </TextSMRegular>

          <Spacer size={"$reg"} />
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <XStack alignItems="center">
                <HeadingXSBold color="$text">{`$ ${product?.currentPrice}`}</HeadingXSBold>
                <Spacer size="$xs" />
                {product?.originalPrice && (
                  <TextSMRegular
                    color="$icon"
                    textDecorationLine="line-through"
                  >
                    ${product?.originalPrice.toFixed(2)}
                  </TextSMRegular>
                )}
              </XStack>
              <TextSMMedium color="$green">{"In-Stock (12)"}</TextSMMedium>
            </YStack>

            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor="$grey"
              paddingHorizontal={"$xs-sm"}
              paddingVertical={"$xs"}
              borderRadius={"$full"}
              justifyContent="space-between"
            >
              <OpTouch>
                <AppImage name={"minus"} size={15} />
              </OpTouch>
              <Spacer size={"$md"} />
              <TextMDSemiBold color="$text">{"1"}</TextMDSemiBold>
              <Spacer size={"$md"} />
              <OpTouch>
                <AppImage name={"addIcon"} size={15} />
              </OpTouch>
            </XStack>
          </XStack>

          <Spacer size={"$reg"} />
          {product?.ratingValue !== undefined && (
            <XStack justifyContent="space-between">
              <XStack alignItems="center">
                <RatingStar rating={product.ratingValue} />
                <Spacer size="$sm-reg" />
                <TextMDBold color="$secondary">
                  {product.ratingValue.toFixed(1)}
                  <Spacer size="$xs" />
                  <TextXSRegular color="$icon">
                    ({product.totalReviewCount?.toLocaleString()})
                  </TextXSRegular>
                </TextMDBold>
              </XStack>
              <TextSMMedium color="$primary">{"14 Questions"}</TextSMMedium>
            </XStack>
          )}

          <Spacer size={"$reg"} />
          <TextMDBold color="$text">{"Description"}</TextMDBold>
          <Spacer size={"$reg"} />
          <ParagraphSM color="$secondary">
            {
              "Take charge of your music and stride along to the beat. High-fidelity audio and legendary noise cancellation work their magic by sealing you in, eliminating distractions, and letting you dive deep into your own rhythm. Toggle between Quiet and Aware Modes, or create a Custom Mode and adjust outside sound to the moment. The design is iconic and the comfort lasting, while an optional audio cable with an in-line microphone plugs you into sound as bold as you, even without a Bluetooth® connection."
            }
          </ParagraphSM>
        </YStack>
      ),
    },
    {
      id: "specs",
      type: "specs",
      content: (
        <YStack>
          <SectionHeader
            title={t("home.sectionHeader.productDetailsSpecs")}
            image={"tableIcon"}
            tintColor={"darkgrey"}
            color="primary"
            onPressSeeAll={() => {}}
          />
          <Spacer size={"$reg"} />
          <ProductSpec item={productSpecs} />
        </YStack>
      ),
    },
    {
      id: "relatedProducts",
      type: "relatedProducts",
      content: (
        <YStack>
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
      ),
    },
  ];

  const renderItem = ({ item }: { item: any }) => {
    return (
      <YStack>
        {item.content}
        {item.id !== "relatedProducts" && <Spacer size={"$xl"} />}
      </YStack>
    );
  };

  return (
    <ScreenContainer backgroundColor="$background">
      <YStack paddingHorizontal="$md">
        <OpTouch onPress={() => router.back()}>
          <AppImage name={"arrowBack"} size={16} />
        </OpTouch>
      </YStack>
      <Spacer size={"$md"} />
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      {/* Full-screen viewer */}
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        doubleTapToZoomEnabled={true}
        visible={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
      />
    </ScreenContainer>
  );
};

export default ProductDetailsScreen;
