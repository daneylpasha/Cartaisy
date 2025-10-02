import { useCollectionWithProducts } from "@/api/hooks/useProducts";
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
import { SCREEN_WIDTH } from "@/constants/styles";
import { t } from "@/translations";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import ImageViewing from "react-native-image-viewing";
import RenderHTML from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

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
  const { id, productData, collectionId } = useLocalSearchParams<{
    id: string;
    productData?: string;
    collectionId?: string;
  }>();

  const { top: TOP_INSET } = useSafeAreaInsets();

  // ✅ Parse the product data from navigation params
  const passedProduct = productData ? JSON.parse(productData as string) : null;

  // ✅ Fetch collection with products if collectionId is provided
  const { data: collectionData, isLoading: isLoadingCollection } =
    useCollectionWithProducts(collectionId);

  console.log("ID:", id);
  console.log("Passed Product Data:", passedProduct);
  console.log("Collection Data:", collectionData);

  // ✅ Use passed product data
  const product = passedProduct;

  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // ✅ Handle image from API - only use source URI
  const productImages = useMemo(() => {
    if (!product) return [];

    // If has images array (Shopify format)
    if (product.images && Array.isArray(product.images)) {
      return product.images
        .map((img: any) =>
          typeof img === "string" ? img : img.src || img.url || ""
        )
        .filter(Boolean);
    }

    // If has single image string
    if (product.image && typeof product.image === "string") {
      return [product.image];
    }

    return [];
  }, [product]);

  // ✅ Create proper image sources for ImageViewing - only URI
  const viewerImages = useMemo(() => {
    return productImages.map((img: string) => ({ uri: img }));
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
                </TextMDBold>
                <Spacer size="$xs" />
                <TextXSRegular color="$icon">
                  ({product.totalReviewCount?.toLocaleString()})
                </TextXSRegular>
              </XStack>
              <TextSMMedium color="$primary">{"14 Questions"}</TextSMMedium>
            </XStack>
          )}

          <Spacer size={"$reg"} />
          <TextMDBold color="$text">{"Description"}</TextMDBold>
          <Spacer size={"$reg"} />
          {passedProduct?.description || product?.description ? (
            <RenderHTML
              contentWidth={SCREEN_WIDTH - 32}
              source={{
                html: passedProduct?.description || product?.description || "",
              }}
              baseStyle={{
                color: getTokenValue("$secondary"),
                fontSize: 14,
                lineHeight: 20,
              }}
            />
          ) : (
            <ParagraphSM color="$secondary">
              No description available
            </ParagraphSM>
          )}
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
      content:
        collectionData?.products && collectionData.products.length > 0 ? (
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
              data={collectionData.products.filter(
                (p: any) => p.id !== product?.id
              )}
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
        ) : null,
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

  if (!product) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
      >
        <ActivityIndicator size="large" color={getTokenValue("$primary")} />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack backgroundColor="$primary" paddingTop={TOP_INSET - 22}>
        <XStack
          paddingHorizontal="$md"
          paddingVertical={"$md"}
          justifyContent="space-between"
        >
          <OpTouch onPress={() => router.back()}>
            <AppImage
              name={"arrowBack"}
              size={16}
              tintColor={getTokenValue("$white")}
            />
          </OpTouch>
          <OpTouch onPress={() => router.navigate("/cart")}>
            <AppImage
              name={"cartIcon"}
              size={24}
              tintColor={getTokenValue("$white")}
            />
          </OpTouch>
        </XStack>
      </YStack>
      {/* <Spacer size={"$md"} /> */}
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
    </YStack>
  );
};

export default ProductDetailsScreen;
