import { useGetInitialSearchScreen } from "@/api/generated/search/search";
import type { Product } from "@/api/types";
import {
  HeadingSMBold,
  ParagraphMD,
  TextLGBold,
  TextSMSemiBold,
  TextXLBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { BrandMark } from "@/components/molecules/BrandMark";
import { CatalogUnavailableState } from "@/components/molecules/CatalogUnavailableState";
import { ProductCard } from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { useCompanyName } from "@/hooks/useCompanyName";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { isCatalogUnavailableError } from "@/utils/catalogUnavailableError";
import {
  buildDefaultHomeModel,
  DEFAULT_HOME_COPY,
  type DefaultHomeHeroAction,
} from "@/utils/defaultHome";
import { extractNumericId } from "@/utils/extractNumericId";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { ShopperSkeleton } from "@/components/molecules/ShopperSkeleton";

type DefaultHomeProps = {
  onRefreshHomescreen: () => Promise<unknown> | unknown;
};

const HERO_HEIGHT = 360;
const HERO_WIDTH = SCREEN_WIDTH - tokens.space.md * 2;
const COLLECTION_CARD_HEIGHT = 220;

const openHeroAction = (action: DefaultHomeHeroAction) => {
  if (action.kind === "collection") {
    router.push({
      pathname: "/products",
      params: {
        collectionId: extractNumericId(action.id),
        categoryName: action.title,
      },
    });
    return;
  }

  router.push({
    pathname: "/products/[id]",
    params: { id: action.id },
  });
};

const openCollection = (id: string, title: string) => {
  router.push({
    pathname: "/products",
    params: {
      collectionId: extractNumericId(id),
      categoryName: title,
    },
  });
};

/**
 * Branded home used when the merchant has not published a renderable
 * homescreen. Catalog data comes from the tenant-scoped initial search
 * screen (trending products and collections, including the backend's
 * catalog fallback). Read-only: this screen never writes Shopify data.
 */
const DefaultHome = ({ onRefreshHomescreen }: DefaultHomeProps) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const storeName = useCompanyName();
  const logoUrl = useStoreConfigStore((state) => state.logoUrl);
  const primaryColor = useStoreConfigStore((state) => state.primaryColor);
  const getReactiveColor = useReactiveTokenColor();
  const accent = primaryColor || "$primary";
  const refreshTint = primaryColor || getReactiveColor("primary");

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetInitialSearchScreen(
      { limit: 12 },
      {
        query: {
          enabled: true,
        },
      }
    );

  const model = buildDefaultHomeModel({
    storeName,
    products: data?.data?.trendingProducts,
    collections: data?.data?.trendingCollections,
  });

  const handleRetry = useCallback(async () => {
    await Promise.all([refetch(), onRefreshHomescreen()]);
  }, [onRefreshHomescreen, refetch]);

  if (isLoading && !data) {
    return <ShopperSkeleton variant="catalog" />;
  }

  if ((isError || !data) && !model) {
    return (
      <CatalogUnavailableState
        error={error}
        onRetry={handleRetry}
        title={
          isCatalogUnavailableError(error)
            ? "Catalog unavailable"
            : "Unable to load home"
        }
        message={
          isCatalogUnavailableError(error)
            ? undefined
            : "We couldn't load the home. Please try again."
        }
      />
    );
  }

  if (!model) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$lg"
        backgroundColor="$background"
        testID="default-home-empty"
      >
        <HeadingSMBold textAlign="center">
          {DEFAULT_HOME_COPY.emptyTitle}
        </HeadingSMBold>
        <Spacer size="$reg" />
        <ParagraphMD color="$textgrey" textAlign="center">
          {DEFAULT_HOME_COPY.emptyBody}
        </ParagraphMD>
        <Spacer size="$xl" />
        <OpTouch onPress={handleRetry} testID="default-home-retry">
          <YStack
            borderWidth={1}
            borderColor={accent}
            borderRadius="$md"
            paddingHorizontal="$lg"
            paddingVertical="$sm"
          >
            <TextSMSemiBold color={accent}>{DEFAULT_HOME_COPY.retry}</TextSMSemiBold>
          </YStack>
        </OpTouch>
      </YStack>
    );
  }

  const hasLogo = Boolean(logoUrl && logoUrl.trim());
  const heroAction = model.hero.action;

  return (
    <ScrollView
      testID="default-home"
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRetry}
          tintColor={refreshTint}
          colors={refreshTint ? [refreshTint] : undefined}
        />
      }
    >
      <Spacer size="$md" />
      <YStack paddingHorizontal="$md">
        <YStack
          height={HERO_HEIGHT}
          borderRadius="$lg"
          overflow="hidden"
          backgroundColor={accent}
          testID="default-home-hero"
        >
          {model.hero.imageUrl ? (
            <YStack position="absolute" top={0} left={0} right={0} bottom={0}>
              <AppImage
                source={model.hero.imageUrl}
                width={HERO_WIDTH}
                height={HERO_HEIGHT}
                resizeMode="cover"
              />
            </YStack>
          ) : null}
          {model.hero.imageUrl ? (
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.78)"]}
              locations={[0, 0.42, 1]}
              style={styles.heroScrim}
            />
          ) : null}
          <YStack flex={1} justifyContent="space-between" padding="$lg" zIndex={2}>
            {hasLogo ? (
              <YStack
                alignSelf="flex-start"
                backgroundColor="$white"
                borderRadius="$md"
                padding="$xs"
              >
                <AppImage
                  source={logoUrl}
                  width={36}
                  height={36}
                  resizeMode="contain"
                />
              </YStack>
            ) : (
              <YStack
                alignSelf="flex-start"
                backgroundColor="$white"
                borderRadius="$md"
                paddingHorizontal="$sm"
                paddingVertical="$xs"
              >
                <BrandMark tone="onLight" size="compact" logoWidth={120} logoHeight={28} />
              </YStack>
            )}
            <YStack gap="$xs">
              <TextXLBold color="$white" numberOfLines={2}>
                {model.hero.title}
              </TextXLBold>
              <ParagraphMD color="$white">{model.hero.subtitle}</ParagraphMD>
              {heroAction ? (
                <OpTouch
                  onPress={() => openHeroAction(heroAction)}
                  testID="default-home-browse"
                >
                  <YStack
                    alignSelf="flex-start"
                    marginTop="$sm"
                    backgroundColor="$white"
                    borderRadius="$full"
                    paddingHorizontal="$lg"
                    paddingVertical="$sm"
                  >
                    <TextSMSemiBold color={accent}>
                      {DEFAULT_HOME_COPY.browse}
                    </TextSMSemiBold>
                  </YStack>
                </OpTouch>
              ) : null}
            </YStack>
          </YStack>
        </YStack>
      </YStack>

      {model.featuredProducts.length > 0 ? (
        <YStack paddingTop="$lg" testID="default-home-featured">
          <SectionHeader
            title={DEFAULT_HOME_COPY.featured}
            showImage={false}
            showSeeAll={false}
          />
          <Spacer size="$reg" />
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productRow}
          >
            {model.featuredProducts.map((product) => (
              <YStack key={product.productId} marginRight="$md">
                <ProductCard
                  product={product as Product}
                  context="in-line"
                  showFavoriteIcon
                />
              </YStack>
            ))}
          </ScrollView>
        </YStack>
      ) : null}

      {model.collections.length > 0 ? (
        <YStack paddingTop="$lg" testID="default-home-collections">
          <SectionHeader
            title={DEFAULT_HOME_COPY.collections}
            showImage={false}
            showSeeAll={false}
          />
          <Spacer size="$reg" />
          <YStack paddingHorizontal="$md">
            {model.collections.map((collection) => (
              <OpTouch
                key={collection.id}
                onPress={() => openCollection(collection.id, collection.title)}
              >
                <YStack
                  height={COLLECTION_CARD_HEIGHT}
                  borderRadius="$lg"
                  overflow="hidden"
                  marginBottom="$md"
                  backgroundColor={accent}
                >
                  {collection.image ? (
                    <YStack position="absolute" top={0} left={0} right={0} bottom={0}>
                      <AppImage
                        source={collection.image}
                        width={HERO_WIDTH}
                        height={COLLECTION_CARD_HEIGHT}
                        resizeMode="cover"
                      />
                    </YStack>
                  ) : null}
                  {collection.image ? (
                    <LinearGradient
                      colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.72)"]}
                      style={styles.collectionScrim}
                    />
                  ) : null}
                  <YStack
                    position="absolute"
                    left={0}
                    right={0}
                    bottom={0}
                    padding="$md"
                    zIndex={1}
                  >
                    <TextLGBold color="$white" numberOfLines={2}>
                      {collection.title}
                    </TextLGBold>
                  </YStack>
                </YStack>
              </OpTouch>
            ))}
          </YStack>
        </YStack>
      ) : null}

      <Spacer size={Platform.OS === "ios" ? bottomInset * 2 : "$lg"} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingBottom: tokens.space.lg,
  },
  productRow: {
    paddingHorizontal: tokens.space.md,
  },
  heroScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 230,
    zIndex: 1,
  },
  collectionScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: 1,
  },
});

export default DefaultHome;
