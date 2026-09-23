/**
 * Smart default home (GitHub issue #121).
 *
 * A published homescreen still renders through the existing module list.
 * When that payload has nothing a shopper can see — no layout, an empty
 * layout, or a layout whose visible modules have no items — the home tab
 * composes a branded fallback from tenant-scoped catalog data. This module
 * is pure so the branch and the catalog shaping can be tested without
 * rendering the screen.
 */

export const HOME_SECTION_DATA_KEYS = {
  carousel: "carousel",
  promo_banners: "promoBanners",
  callout_banners: "calloutBanners",
  category_grid: "categoryGrid",
  collection_displays: "collectionDisplays",
  collection_showcases: "collectionShowcases",
  category_collection_grid: "categoryCollectionGrid",
} as const;

export type HomeLayoutType = keyof typeof HOME_SECTION_DATA_KEYS;

export type HomeLayoutItem = {
  type: HomeLayoutType;
  position: number;
  isVisible: boolean;
};

/** Section order used only when the backend sends no layout at all. */
export const DEFAULT_HOME_SECTION_ORDER: HomeLayoutItem[] = [
  { type: "carousel", position: 0, isVisible: true },
  { type: "category_grid", position: 1, isVisible: true },
  { type: "callout_banners", position: 2, isVisible: true },
  { type: "collection_displays", position: 3, isVisible: true },
  { type: "category_collection_grid", position: 4, isVisible: true },
  { type: "promo_banners", position: 5, isVisible: true },
  { type: "collection_showcases", position: 6, isVisible: true },
];

export const DEFAULT_HOME_COPY = {
  welcomeTitle: "Welcome",
  heroSubtitle: "Selected from the shop",
  browse: "Browse",
  featured: "Featured",
  collections: "Collections",
  emptyTitle: "Nothing to show yet",
  emptyBody: "Products will show up here once they're available.",
  retry: "Try again",
} as const;

const FEATURED_PRODUCT_LIMIT = 8;
const COLLECTION_LIMIT = 6;

export type DefaultHomeProduct = {
  productId: string;
  title: string;
  images?: string[];
  price?: number;
};

export type DefaultHomeCollection<TProduct extends DefaultHomeProduct = DefaultHomeProduct> =
  {
    id: string;
    title: string;
    image?: string;
    products?: TProduct[];
  };

export type DefaultHomeHeroAction =
  | { kind: "collection"; id: string; title: string }
  | { kind: "product"; id: string };

export type DefaultHomeHero = {
  imageUrl?: string;
  title: string;
  subtitle: string;
  action?: DefaultHomeHeroAction;
};

export type DefaultHomeModel<
  TProduct extends DefaultHomeProduct = DefaultHomeProduct,
  TCollection extends DefaultHomeCollection<TProduct> = DefaultHomeCollection<TProduct>,
> = {
  hero: DefaultHomeHero;
  featuredProducts: TProduct[];
  collections: TCollection[];
};

type HomescreenPayload = {
  layout?: HomeLayoutItem[] | null;
} | null | undefined;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isKnownLayoutType(type: unknown): type is HomeLayoutType {
  return typeof type === "string" && type in HOME_SECTION_DATA_KEYS;
}

export function homeSectionHasItems(
  data: HomescreenPayload,
  type: HomeLayoutType
): boolean {
  if (!data) return false;
  const value = (data as Record<string, unknown>)[HOME_SECTION_DATA_KEYS[type]];
  return Array.isArray(value) && value.length > 0;
}

/**
 * Visible homescreen modules that actually have items.
 * An absent or empty `layout` keeps the historical default section order,
 * so a backend that fills sections without a layout array still renders.
 * A layout that names only empty modules yields nothing — that is the
 * signal to show the smart default instead of a blank home.
 */
export function getRenderableHomeSections(
  data: HomescreenPayload
): HomeLayoutItem[] {
  const published = data?.layout;
  const layout =
    Array.isArray(published) && published.length > 0
      ? published
      : DEFAULT_HOME_SECTION_ORDER;

  return layout.filter((item) => {
    if (!item || item.isVisible !== true || !isKnownLayoutType(item.type)) {
      return false;
    }
    return homeSectionHasItems(data, item.type);
  });
}

export function shouldUseDefaultHome(data: HomescreenPayload): boolean {
  return getRenderableHomeSections(data).length === 0;
}

function isDisplayableProduct<TProduct extends DefaultHomeProduct>(
  product: TProduct | null | undefined
): product is TProduct {
  return (
    !!product &&
    isNonEmptyString(product.productId) &&
    isNonEmptyString(product.title) &&
    typeof product.price === "number"
  );
}

function hasImage(product: DefaultHomeProduct): boolean {
  return isNonEmptyString(product.images?.[0]);
}

function dedupeProducts<TProduct extends DefaultHomeProduct>(
  products: readonly (TProduct | null | undefined)[]
): TProduct[] {
  const seen = new Set<string>();
  const result: TProduct[] = [];
  for (const product of products) {
    if (!isDisplayableProduct(product) || seen.has(product.productId)) {
      continue;
    }
    seen.add(product.productId);
    result.push(product);
  }
  return result;
}

function preferImagedProducts<TProduct extends DefaultHomeProduct>(
  products: readonly TProduct[]
): TProduct[] {
  const withImages: TProduct[] = [];
  const withoutImages: TProduct[] = [];
  for (const product of products) {
    if (hasImage(product)) {
      withImages.push(product);
    } else {
      withoutImages.push(product);
    }
  }
  return [...withImages, ...withoutImages];
}

function isDisplayableCollection<
  TProduct extends DefaultHomeProduct,
  TCollection extends DefaultHomeCollection<TProduct>,
>(collection: TCollection | null | undefined): collection is TCollection {
  return !!collection && isNonEmptyString(collection.id) && isNonEmptyString(collection.title);
}

/**
 * Shapes tenant catalog data into a hero plus featured products and/or
 * collections. Returns null when the catalog has nothing displayable, so
 * the screen can show the empty state instead of an empty hero.
 *
 * Featured products prefer the product list. When that list is empty,
 * products nested on collections are used so a collections-only payload
 * still has a product row. Nothing here writes catalog data.
 */
export function buildDefaultHomeModel<
  TProduct extends DefaultHomeProduct,
  TCollection extends DefaultHomeCollection<TProduct>,
>(input: {
  storeName?: string;
  products?: readonly (TProduct | null | undefined)[] | null;
  collections?: readonly (TCollection | null | undefined)[] | null;
}): DefaultHomeModel<TProduct, TCollection> | null {
  const collections = (input.collections ?? []).filter(isDisplayableCollection);
  const directProducts = dedupeProducts(input.products ?? []);
  const nestedProducts = dedupeProducts(
    collections.flatMap((collection) => collection.products ?? [])
  );
  const featuredProducts = preferImagedProducts(
    directProducts.length > 0 ? directProducts : nestedProducts
  ).slice(0, FEATURED_PRODUCT_LIMIT);
  const visibleCollections = collections.slice(0, COLLECTION_LIMIT);

  if (featuredProducts.length === 0 && visibleCollections.length === 0) {
    return null;
  }

  const heroCollection = visibleCollections.find((collection) =>
    isNonEmptyString(collection.image)
  );
  const heroProduct = featuredProducts.find(hasImage);
  const storeName = input.storeName?.trim() ?? "";

  const hero: DefaultHomeHero = {
    imageUrl: heroCollection?.image || heroProduct?.images?.[0],
    title: storeName || DEFAULT_HOME_COPY.welcomeTitle,
    subtitle: DEFAULT_HOME_COPY.heroSubtitle,
  };

  if (heroCollection) {
    hero.action = {
      kind: "collection",
      id: heroCollection.id,
      title: heroCollection.title,
    };
  } else if (heroProduct) {
    hero.action = { kind: "product", id: heroProduct.productId };
  }

  return {
    hero,
    featuredProducts,
    collections: visibleCollections,
  };
}
