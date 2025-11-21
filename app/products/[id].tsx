import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/api/generated/favorites/favorites";
import { useGetProductDetail } from "@/api/generated/products/products";
import { useGetProductRecommendations } from "@/api/generated/recommendations/recommendations";
import { useCartManager } from "@/api/hooks/useCartManager";
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
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import ProductCarousel from "@/components/molecules/product/pdp/ProductCarousel";
import ProductSpec from "@/components/molecules/product/pdp/ProductSpec";
import {
  GRID_COLUMN_GAP,
  GRID_SIDE_PADDING,
  ProductCard,
} from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import AddToCartSuccessModal from "@/components/organisms/AddToCartSuccessModal";
import ErrorModal from "@/components/organisms/ErrorModal";
import { RatingStar } from "@/components/organisms/home";
import { SCREEN_WIDTH } from "@/constants/styles";
import useCartStore from "@/store/useCartStore";
import useFavoritesStore from "@/store/useFavoritesStore";
import { t } from "@/translations";
import { getColorHex } from "@/utils/colorHelper";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import RenderHTML from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { top: TOP_INSET } = useSafeAreaInsets();
  const { getTotalQuantity } = useCartStore();
  const cartItemCount = getTotalQuantity();
  const {
    addToCart,
    isLoading: isAddingToCart,
    error: addToCartError,
  } = useCartManager();

  const { data: productDetailData, isLoading: isLoadingProduct } =
    useGetProductDetail(id);

  // Extract productId from product data (this is the Shopify Product ID)
  const shopifyProductId = productDetailData?.data?.productId;

  // Fetch recommendations using Shopify Product ID
  const { data: recommendationsData } = useGetProductRecommendations(
    shopifyProductId || "",
    { limit: 6 },
    {
      query: {
        enabled: !!shopifyProductId,
      },
    }
  );

  // Use Zustand store for favorites
  const isFavoriteInStore = useFavoritesStore((state) => state.isFavorite(id));
  const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteFromStore = useFavoritesStore(
    (state) => state.removeFavorite
  );

  // Parse product data from API response
  const product = useMemo(() => {
    if (!productDetailData?.data) return null;

    const apiProduct = productDetailData.data;

    return {
      id: apiProduct.productId,
      title: apiProduct.title || "",
      description: apiProduct.description || "",
      descriptionHtml: apiProduct.descriptionHtml || "",
      images: apiProduct.images || [],
      currentPrice: apiProduct.price || 0,
      originalPrice: apiProduct.compareAtPrice,
      currency: apiProduct.currency || "USD",
      discountPercent: apiProduct.badges?.discountPercentage || 0,
      ratingValue: apiProduct.rating || 0,
      totalReviewCount: apiProduct.reviewsCount || 0,
      soldThisMonth: apiProduct.soldThisMonth || 0,
      variants: apiProduct.variants || [],
      vendor: apiProduct.vendor || "",
      productType: apiProduct.productType || "",
      tags: apiProduct.tags || [],
      handle: apiProduct.handle || "",
      availableForSale: apiProduct.availableForSale ?? true,
      totalInventory: apiProduct.totalInventory || 0,
      inStock: apiProduct.inStock ?? false,
      isBestSeller: apiProduct.badges?.isBestSeller || false,
    };
  }, [productDetailData]);

  // Extract brand name from metafields
  const brandName = useMemo(() => {
    if (
      !productDetailData?.data?.metafields ||
      productDetailData.data.metafields.length === 0
    ) {
      return undefined;
    }

    // Try to find brand metafield with different possible keys
    const brandMetafield = productDetailData.data.metafields.find(
      (metafield: any) => {
        const key = metafield.key?.toLowerCase() || "";
        return (
          key.includes("brand") || key === "manufacturer" || key === "vendor"
        );
      }
    );

    if (brandMetafield && brandMetafield.value) {
      const value = String(brandMetafield.value);
      // Don't use if it's a GID reference
      if (!value.includes("gid://shopify")) {
        return value;
      }
    }

    return undefined;
  }, [productDetailData?.data?.metafields]);

  // Transform metafields to the format expected by ProductSpec
  const productSpecsFromMetafields = useMemo(() => {
    if (
      !productDetailData?.data?.metafields ||
      productDetailData.data.metafields.length === 0
    ) {
      return [];
    }

    return productDetailData.data.metafields.map((metafield: any) => {
      // Ensure value is always a string
      const value = metafield.value != null ? String(metafield.value) : "";

      // Format the label: remove hyphens, capitalize each word
      const label = metafield.key
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // If value is a GID reference or empty, show appropriate message
      const displayValue =
        !value || value.trim() === ""
          ? "N/A"
          : value.includes("gid://shopify")
          ? "Contact support for details"
          : value;

      return {
        label,
        value: displayValue,
      };
    });
  }, [productDetailData?.data?.metafields]);

  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  // Favorite state from Zustand store
  const [isFavorited, setIsFavorited] = useState(isFavoriteInStore);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);

  const COLLAPSED_HEIGHT = 80; // Maximum height when collapsed

  const toggle = () => {
    // animation کے ساتھ expand/collapse
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((v) => !v);
  };

  // Sync with Zustand store when it changes
  React.useEffect(() => {
    setIsFavorited(isFavoriteInStore);
  }, [isFavoriteInStore]);

  // Scale animation for heart
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Blink animation for heart (during API call)
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const blinkAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Start blinking animation
  const startBlinking = () => {
    blinkAnimationRef.current?.stop();
    blinkAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    blinkAnimationRef.current.start();
  };

  // Stop blinking animation
  const stopBlinking = () => {
    blinkAnimationRef.current?.stop();
    blinkAnim.setValue(1);
  };

  // Add favorite mutation
  const { mutate: addFavoriteMutation } = useAddFavorite({
    mutation: {
      onMutate: () => {
        // Optimistic update: Add to Zustand store immediately
        addFavoriteToStore(id);
      },
      onSuccess: () => {
        console.log("Successfully added to favorites");
        stopBlinking();
        // Zustand already updated in onMutate
      },
      onError: (error) => {
        console.error("Failed to add favorite:", error);
        setIsFavorited(false);
        // Remove from Zustand store since API failed
        removeFavoriteFromStore(id);
        stopBlinking();
      },
    },
  });

  // Remove favorite mutation
  const { mutate: removeFavoriteMutation } = useRemoveFavorite({
    mutation: {
      onMutate: () => {
        // Optimistic update: Remove from Zustand store immediately
        removeFavoriteFromStore(id);
      },
      onSuccess: () => {
        console.log("Successfully removed from favorites");
        stopBlinking();
        // Zustand already updated in onMutate
      },
      onError: (error) => {
        console.error("Failed to remove favorite:", error);
        setIsFavorited(true);
        // Re-add to Zustand store since API failed
        addFavoriteToStore(id);
        stopBlinking();
      },
    },
  });

  // Handle favorite press
  const handleFavoritePress = () => {
    const willBeFavorited = !isFavorited;

    // Heart pop animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Start blinking animation
    startBlinking();

    setIsFavorited(willBeFavorited);

    if (willBeFavorited) {
      addFavoriteMutation({ data: { productId: id } });
    } else {
      removeFavoriteMutation({ productId: id });
    }
  };

  // Ref for FlatList to enable scrolling
  const flatListRef = useRef<FlatList>(null);

  // Handle product images
  const productImages = useMemo(() => {
    if (!product) return [];
    return product.images || [];
  }, [product]);

  // Create proper image sources for ImageViewing
  const viewerImages = useMemo(() => {
    return productImages.map((img: string) => ({ uri: img }));
  }, [productImages]);

  const variantTypes = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];

    const typesMap = new Map<string, Set<string>>();

    product.variants.forEach((variant: any) => {
      variant.selectedOptions?.forEach((option: any) => {
        if (!typesMap.has(option.name)) {
          typesMap.set(option.name, new Set());
        }
        typesMap.get(option.name)?.add(option.value);
      });
    });

    // Filter out "Title" variant type with only "Default Title"
    return Array.from(typesMap.entries())
      .filter(([name, values]) => {
        const valueArray = Array.from(values);
        // Hide if it's "Title" type with only "Default Title" value
        if (
          name === "Title" &&
          valueArray.length === 1 &&
          valueArray[0] === "Default Title"
        ) {
          return false;
        }
        return true;
      })
      .map(([name, values]) => ({
        name,
        options: Array.from(values),
      }));
  }, [product?.variants]);

  // Find the selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      return null;
    }

    // If no variant types (single variant product), return first variant
    if (variantTypes.length === 0 && product.variants.length === 1) {
      return product.variants[0];
    }

    // If variants exist but no options selected yet, return null
    if (Object.keys(selectedOptions).length === 0) {
      return null;
    }

    // Find matching variant
    const variant = product.variants.find((variant: any) => {
      return variant.selectedOptions?.every((option: any) => {
        return selectedOptions[option.name] === option.value;
      });
    });

    return variant || null;
  }, [product?.variants, selectedOptions, variantTypes.length]);

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
          isFavorited={isFavorited}
          onFavoritePress={handleFavoritePress}
          scaleAnim={scaleAnim}
          blinkAnim={blinkAnim}
        />
      ),
    },
    {
      id: "productInfo",
      type: "productInfo",
      content: (
        <YStack paddingHorizontal="$md">
          <XStack alignItems="center">
            {product?.isBestSeller && (
              <>
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
              </>
            )}
            {product?.discountPercent && product.discountPercent > 0 && (
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
                <TextSMMedium color="$error">{`${Math.round(
                  product.discountPercent
                )}% OFF`}</TextSMMedium>
              </XStack>
            )}
          </XStack>

          <Spacer size={"$md"} />
          <TextXLMedium color={"$secondary"}>
            {product?.title || ""}
          </TextXLMedium>
          <Spacer size={"$reg"} />
          {product?.soldThisMonth !== undefined &&
            product.soldThisMonth > 0 && (
              <TextSMRegular color="$secondary">
                {`${product.soldThisMonth} sold this month`}
              </TextSMRegular>
            )}

          <Spacer size={"$reg"} />
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <XStack alignItems="center">
                <HeadingXSBold color="$text">{`US$${(
                  (product?.currentPrice || 0) * count
                ).toFixed(2)}`}</HeadingXSBold>
                <Spacer size="$xs" />
                {product?.originalPrice && (
                  <TextSMRegular
                    color="$icon"
                    textDecorationLine="line-through"
                  >
                    US${product?.originalPrice.toFixed(2)}
                  </TextSMRegular>
                )}
              </XStack>
              <TextSMMedium
                color={
                  product?.inStock && product?.totalInventory > 0
                    ? "$green"
                    : "$error"
                }
              >
                {product?.inStock && product?.totalInventory > 0
                  ? `In-Stock (${product.totalInventory})`
                  : "Out of Stock"}
              </TextSMMedium>
            </YStack>

            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor="$grey"
              paddingHorizontal={"$xs-sm"}
              paddingVertical={"$xs"}
              borderRadius={"$md"}
              justifyContent="space-between"
            >
              <OpTouch
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => {
                  if (count > 1) setCount(count - 1);
                }}
                disabled={count <= 1}
              >
                <AppImage
                  name={"minus"}
                  size={15}
                  tintColor={getTokenValue("$primary")}
                />
              </OpTouch>
              <Spacer size={"$md"} />
              <TextMDSemiBold color="$text">{count}</TextMDSemiBold>
              <Spacer size={"$md"} />
              <OpTouch
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => {
                  const maxStock =
                    selectedVariant?.quantityAvailable ||
                    product?.totalInventory ||
                    0;
                  if (count < maxStock) {
                    setCount(count + 1);
                  } else {
                    setErrorModal({
                      visible: true,
                      title: "Maximum Stock Reached",
                      message: `Only ${maxStock} items available in stock.`,
                    });
                  }
                }}
                disabled={
                  count >=
                  (selectedVariant?.quantityAvailable ||
                    product?.totalInventory ||
                    0)
                }
              >
                <AppImage
                  name={"addIcon"}
                  size={15}
                  tintColor={getTokenValue("$primary")}
                />
              </OpTouch>
            </XStack>
          </XStack>

          <Spacer size={"$reg"} />
          {product?.ratingValue !== undefined &&
            product.ratingValue > 0 &&
            product?.totalReviewCount > 0 && (
              <XStack justifyContent="space-between">
                <XStack alignItems="center">
                  <RatingStar rating={product.ratingValue} />
                  <Spacer size="$sm-reg" />
                  <TextMDBold color="$secondary">
                    {product.ratingValue.toFixed(1)}
                  </TextMDBold>
                  <Spacer size="$xs" />
                  <TextXSRegular color="$icon">
                    ({product.totalReviewCount.toLocaleString()})
                  </TextXSRegular>
                </XStack>
              </XStack>
            )}
        </YStack>
      ),
    },

    ...variantTypes.map((variantType, index) => ({
      id: `variant-${variantType.name}`,
      type: "variant",
      content: (
        <YStack key={variantType.name}>
          {/* Show error only on first variant section */}

          <SectionHeader
            title={variantType.name}
            image={
              variantType.name.toLowerCase().includes("color")
                ? "palette"
                : "tableIcon"
            }
            tintColor={"darkgrey"}
            color="primary"
            onPressSeeAll={() => {}}
          />
          <YStack paddingHorizontal={"$md"}>
            <Spacer size={"$sm"} />
            {index === 0 && selectionError && (
              <TextSMRegular color="$error">{selectionError}</TextSMRegular>
            )}
          </YStack>
          <Spacer size={"$reg"} />
          <FlatList
            data={variantType.options}
            renderItem={({ item: optionValue }) => {
              const isSelected =
                selectedOptions[variantType.name] === optionValue;
              const isColorVariant = variantType.name
                .toLowerCase()
                .includes("color");
              const colorHex = isColorVariant ? getColorHex(optionValue) : null;

              // Check if this variant combination is available
              const isAvailable = product?.variants?.some((variant: any) => {
                return (
                  variant.selectedOptions?.some(
                    (opt: any) =>
                      opt.name === variantType.name && opt.value === optionValue
                  ) && variant.quantityAvailable > 0
                );
              });

              return (
                <OpTouch
                  onPress={() => {
                    if (!isAvailable) return; // Don't allow selection if unavailable
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [variantType.name]: optionValue,
                    }));
                    // Clear error when user selects any variant
                    setSelectionError(null);
                  }}
                  disabled={!isAvailable}
                >
                  <XStack
                    borderWidth={isSelected ? 2 : 1}
                    borderColor={
                      !isAvailable
                        ? "$border"
                        : isSelected
                        ? "$primary"
                        : "$grey"
                    }
                    borderRadius={"$md"}
                    paddingVertical={"$sm"}
                    paddingHorizontal={"$reg"}
                    alignItems="center"
                    alignSelf="center"
                    backgroundColor={
                      !isAvailable
                        ? "$background"
                        : isSelected
                        ? "$primarylight"
                        : "transparent"
                    }
                    opacity={!isAvailable ? 0.6 : 1}
                  >
                    {colorHex && (
                      <>
                        <YStack
                          backgroundColor={colorHex}
                          borderRadius={"$full"}
                          borderWidth={1}
                          borderColor={!isAvailable ? "$border" : "$grey"}
                          width={16}
                          height={16}
                          opacity={!isAvailable ? 0.4 : 1}
                        />
                        <Spacer size={"$sm"} />
                      </>
                    )}
                    {!colorHex ? <Spacer size={"$sm"} /> : null}
                    <TextMDRegular
                      color={
                        !isAvailable
                          ? "$secondary"
                          : isSelected
                          ? "$primary"
                          : "$text"
                      }
                    >
                      {String(optionValue)}
                    </TextMDRegular>
                    <Spacer size={"$sm"} />
                  </XStack>
                </OpTouch>
              );
            }}
            keyExtractor={(item) => `${variantType.name}-${item}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 4,
              paddingHorizontal: GRID_SIDE_PADDING,
              gap: GRID_COLUMN_GAP,
            }}
          />
        </YStack>
      ),
    })),
    // Description section
    {
      id: "description",
      type: "description",
      content: (
        <YStack paddingHorizontal="$md">
          <TextMDBold color="$text">{"Description"}</TextMDBold>
          <Spacer size={"$reg"} />
          {product?.descriptionHtml && product.descriptionHtml.trim() !== "" ? (
            <>
              {/* Hidden full-height version to measure actual content height */}
              <YStack
                position="absolute"
                opacity={0}
                pointerEvents="none"
                width={SCREEN_WIDTH - 32}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  if (height > 0 && descriptionHeight === 0) {
                    setDescriptionHeight(height);
                    // Show toggle if content is taller than collapsed height
                    if (height > COLLAPSED_HEIGHT) {
                      setShowToggle(true);
                    }
                  }
                }}
              >
                <RenderHTML
                  contentWidth={SCREEN_WIDTH - 32}
                  source={{
                    html: product.descriptionHtml,
                  }}
                  baseStyle={{
                    color: getTokenValue("$secondary"),
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                />
              </YStack>

              {/* Visible version with height control */}
              <YStack
                overflow="hidden"
                maxHeight={isExpanded ? undefined : COLLAPSED_HEIGHT}
              >
                <RenderHTML
                  contentWidth={SCREEN_WIDTH - 32}
                  source={{
                    html: product.descriptionHtml,
                  }}
                  baseStyle={{
                    color: getTokenValue("$secondary"),
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                />
              </YStack>
            </>
          ) : (
            <ParagraphSM color="$secondary">
              No description available
            </ParagraphSM>
          )}

          {showToggle && (
            <>
              <Spacer size={"$sm"} />
              <OpTouch onPress={toggle} activeOpacity={0.7}>
                <XStack alignItems="center" gap="$xs">
                  <TextSMRegular color="$primary">
                    {isExpanded ? "See less" : "See more"}
                  </TextSMRegular>
                  <AppImage
                    name={isExpanded ? "arrowUp" : "arrowDown"}
                    size={12}
                    tintColor={getTokenValue("$primary")}
                  />
                </XStack>
              </OpTouch>
            </>
          )}
        </YStack>
      ),
    },
    // Only add specs section if metafields exist
    ...(productSpecsFromMetafields.length > 0
      ? [
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
                <ProductSpec item={productSpecsFromMetafields} />
              </YStack>
            ),
          },
        ]
      : []),
    // Recommendations section
    ...(recommendationsData?.data?.recommendedProducts &&
    recommendationsData.data.recommendedProducts.length > 0
      ? [
          {
            id: "recommendations",
            type: "recommendations",
            content: (
              <YStack>
                <SectionHeader
                  title={t("home.sectionHeader.youMightAlsoLike")}
                  image={"bulb"}
                  tintColor={"darkgrey"}
                />
                <Spacer size={"$xl"} />
                <FlatList
                  data={recommendationsData.data.recommendedProducts}
                  keyExtractor={(product, index) =>
                    `recommended-${product._id}-${index}`
                  }
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: GRID_SIDE_PADDING,
                    gap: GRID_COLUMN_GAP,
                  }}
                  renderItem={({ item: product }) => {
                    const productId = product.shopifyProductId || product._id;
                    return (
                      <ProductCard
                        product={
                          {
                            productId: productId,
                            title: product.title,
                            handle: product.handle,
                            vendor: product.vendor,
                            price: product.price,
                            compareAtPrice: product.compareAtPrice,
                            currency: "USD",
                            images: product.images?.map((img) => img.url) || [],
                            rating: 0,
                            reviewsCount: 0,
                            tags: product.tags || [],
                            inStock: true,
                            availableQuantity: 0,
                            totalQuantity: 0,
                          } as any
                        }
                        context="grid"
                        showFavoriteIcon={true}
                        isFavorite={useFavoritesStore
                          .getState()
                          .isFavorite(productId)}
                      />
                    );
                  }}
                />
              </YStack>
            ),
          },
        ]
      : []),
  ];

  const renderItem = ({ item }: { item: any }) => {
    return (
      <YStack>
        {item.content}
        {item.id !== "relatedProducts" ? <Spacer size={"$xl"} /> : null}
      </YStack>
    );
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    setSelectionError(null);

    // Check if product is in stock
    if (!product?.inStock || product?.totalInventory === 0) {
      setErrorModal({
        visible: true,
        title: "Out of Stock",
        message: "This product is currently out of stock.",
      });
      return;
    }

    // Check if variant selection is required
    if (variantTypes.length > 0 && !selectedVariant) {
      // Show error message
      setSelectionError(
        `Please select ${variantTypes.map((v) => v.name).join(", ")}`
      );

      // Scroll to first variant section (index 2: carousel=0, productInfo=1, first variant=2)
      flatListRef.current?.scrollToIndex({
        index: 2,
        animated: true,
        viewPosition: 0.2, // Position it 20% from top
      });
      return;
    }

    // Get the variant to add (selected variant or first variant for single variant products)
    const variantToAdd = selectedVariant || product?.variants?.[0];

    if (!variantToAdd) {
      setErrorModal({
        visible: true,
        title: "Error",
        message: "Unable to add product to cart.",
      });
      return;
    }

    // Check if quantity is available
    if (count > variantToAdd.quantityAvailable) {
      setErrorModal({
        visible: true,
        title: "Insufficient Stock",
        message: `Only ${variantToAdd.quantityAvailable} items available.`,
      });
      return;
    }

    // Create cart item
    const cartItem = {
      productId: product.id,
      variantId: variantToAdd.id,
      merchandiseId: variantToAdd.id, // Shopify merchandise ID (same as variant ID)
      title: product.title,
      variantTitle:
        variantToAdd.title === "Default Title" ? "" : variantToAdd.title,
      image: variantToAdd.image || product.images?.[0] || null,
      price: variantToAdd.price,
      compareAtPrice: variantToAdd.compareAtPrice || null,
      currency: product.currency,
      quantity: count,
      quantityAvailable: variantToAdd.quantityAvailable,
      selectedOptions: variantToAdd.selectedOptions || [],
      brandName: brandName, // Add brand name from metafields
    };

    console.log("[PDP] Cart item being added:", {
      title: cartItem.title,
      brandName: cartItem.brandName,
      hasBrandName: !!cartItem.brandName,
    });

    try {
      // Add to cart via API with validation and recovery
      await addToCart(cartItem);

      // Show success modal only on successful API response
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal if API call fails
      setErrorModal({
        visible: true,
        title: "Error",
        message:
          addToCartError || "Failed to add item to cart. Please try again.",
      });
    }
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    router.navigate("/cart");
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        backgroundColor="$primary"
        paddingTop={Platform.OS === "ios" ? TOP_INSET - 22 : TOP_INSET}
      >
        <XStack
          paddingHorizontal="$md"
          paddingVertical={"$md"}
          justifyContent="space-between"
          alignItems="center"
        >
          <OpTouch onPress={() => router.back()}>
            <AppImage
              name={"arrowBack"}
              size={16}
              tintColor={getTokenValue("$white")}
            />
          </OpTouch>

          {/* Cart Icon */}
          <OpTouch onPress={() => router.navigate("/cart")}>
            <YStack>
              <AppImage
                name={"cartIcon"}
                size={24}
                tintColor={getTokenValue("$white")}
              />
              {cartItemCount > 0 && (
                <XStack
                  position="absolute"
                  top={-6}
                  right={-6}
                  backgroundColor="$yellow"
                  borderRadius={"$full"}
                  minWidth={18}
                  height={18}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal={"$xs"}
                >
                  <TextXSRegular color="$white" fontSize={10}>
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </TextXSRegular>
                </XStack>
              )}
            </YStack>
          </OpTouch>
        </XStack>
      </YStack>
      {/* <Spacer size={"$md"} /> */}
      {isLoadingProduct || !product ? (
        <YStack
          flex={1}
          backgroundColor="$background"
          justifyContent="center"
          alignItems="center"
        >
          <Loader size="large" color="$primary" />
        </YStack>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={sections}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              // Handle scroll failure gracefully
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              }, 100);
            }}
          />
          <Divider />
          <YStack paddingHorizontal="$md" paddingVertical={"$lg"}>
            <SecondaryButton
              icon={
                <AppImage
                  tintColor={getTokenValue("$primary")}
                  size={18}
                  name="cartIcon"
                />
              }
              iconPosition="left"
              onPress={handleAddToCart}
              label="Add to Cart "
              isLoading={isAddingToCart}
            />
            <Spacer size={"$sm"} />
            <PrimaryButton label="Buy Now" onPress={handleBuyNow} />
            <Spacer size={"$sm"} />
          </YStack>
        </>
      )}

      {/* Full-screen viewer */}
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        doubleTapToZoomEnabled={true}
        visible={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
      />
      <AddToCartSuccessModal
        visible={showSuccessModal}
        itemCount={count}
        onViewCart={() => {
          setShowSuccessModal(false);
          setCount(1);
          router.push("/cart");
        }}
        onContinueShopping={() => {
          setShowSuccessModal(false);
          setCount(1);
        }}
      />
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() =>
          setErrorModal({ visible: false, title: "", message: "" })
        }
      />
    </YStack>
  );
};

export default ProductDetailsScreen;
