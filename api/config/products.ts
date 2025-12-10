const PRODUCTS_CONFIG = {
  SHOPIFY: {
    STORE_URL: process.env.EXPO_PUBLIC_SHOPIFY_STORE_URL || "",
    API_VERSION: process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION || "2025-07",
    // ENDPOINTS: {
    //   PRODUCTS: "/admin/api/2025-07/products.json",
    //   COLLECTIONS: "/admin/api/2025-07/custom_collections.json",
    //   SMART_COLLECTIONS: "/admin/api/2025-07/smart_collections.json",
    //   COLLECTION_PRODUCTS:
    //     "/admin/api/2025-07/collections/{collection_id}/products.json",
    // },
  },
  LIMITS: {
    HOME_PRODUCTS: 6,
    DEFAULT_PRODUCTS: 20,
  },
  DEFAULT_VALUES: {
    RATING: 4.5,
    REVIEW_COUNT: 100,
  },
};

export const getShopifyHeaders = () => {
  const token = process.env.EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN is not defined in environment variables"
    );
  }

  return {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json",
  };
};

export const getCollectionWithProductsUrl = (collectionId: string) => {
  return `${PRODUCTS_CONFIG.SHOPIFY.STORE_URL}/admin/api/${PRODUCTS_CONFIG.SHOPIFY.API_VERSION}/collections/${collectionId}.json`;
};

export const getCollectionProductsUrl = (collectionId: string) => {
  // Use products endpoint with collection_id filter to get full product data
  return `${PRODUCTS_CONFIG.SHOPIFY.STORE_URL}/admin/api/${PRODUCTS_CONFIG.SHOPIFY.API_VERSION}/products.json?collection_id=${collectionId}&limit=250`;
};

export default PRODUCTS_CONFIG;
