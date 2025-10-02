import PRODUCTS_CONFIG, {
  getCollectionProductsUrl,
  getCollectionWithProductsUrl,
  getShopifyHeaders,
} from "@/api/config/products";
import { useQuery } from "@tanstack/react-query";

const fetchCollectionWithProducts = async (collectionId: string) => {
  const [collectionResponse, productsResponse] = await Promise.all([
    fetch(getCollectionWithProductsUrl(collectionId), {
      method: "GET",
      headers: getShopifyHeaders(),
    }),
    fetch(getCollectionProductsUrl(collectionId), {
      method: "GET",
      headers: getShopifyHeaders(),
    }),
  ]);

  if (!collectionResponse.ok) {
    throw new Error(
      `Failed to fetch collection: ${collectionResponse.statusText}`
    );
  }

  if (!productsResponse.ok) {
    throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
  }

  const collectionData = await collectionResponse.json();
  const productsData = await productsResponse.json();

  // Map products
  const mappedProducts =
    productsData.products?.map((product: any) => {
      const currentPrice = parseFloat(product.variants?.[0]?.price || "0");
      const originalPrice = parseFloat(
        product.variants?.[0]?.compare_at_price || "0"
      );

      // Calculate progress based on inventory
      const inventoryQuantity = product.variants?.[0]?.inventory_quantity || 0;
      const inventoryManagement = product.variants?.[0]?.inventory_management;

      // Calculate progress based on inventory scarcity
      // Lower stock = higher urgency/progress
      let progressValue = 0;
      if (inventoryManagement && inventoryQuantity >= 0) {
        if (inventoryQuantity === 0) {
          progressValue = 100; // Sold out
        } else if (inventoryQuantity <= 10) {
          progressValue = 90; // Almost sold out
        } else if (inventoryQuantity <= 30) {
          progressValue = 70; // Low stock
        } else if (inventoryQuantity <= 60) {
          progressValue = 50; // Medium stock
        } else {
          progressValue = 30; // High stock
        }
      }

      return {
        id: product.id.toString(),
        title: product.title,
        description: collectionData.collection?.body_html || product.body_html || "",
        image: product.images?.[0]?.src || "",
        currentPrice: currentPrice,
        originalPrice: originalPrice || currentPrice,
        discountPercent: product.variants?.[0]?.compare_at_price
          ? Math.round(
              (1 -
                parseFloat(product.variants[0].price) /
                  parseFloat(product.variants[0].compare_at_price)) *
                100
            )
          : 0,
        progressValue: progressValue,
        ratingValue: PRODUCTS_CONFIG.DEFAULT_VALUES.RATING,
        totalReviewCount: PRODUCTS_CONFIG.DEFAULT_VALUES.REVIEW_COUNT,
        onToggleWishlist: () => {},
      };
    }) || [];

  // Return complete collection data with products
  return {
    id: collectionData.collection?.id?.toString() || collectionId,
    title: collectionData.collection?.title || "",
    description: collectionData.collection?.body_html || "",
    image: collectionData.collection?.image?.src || "",
    products: mappedProducts,
  };
};

// Hook to fetch complete collection data with products
export const useCollectionWithProducts = (collectionId?: string) => {
  return useQuery({
    queryKey: ["collectionWithProducts", collectionId],
    queryFn: () => fetchCollectionWithProducts(collectionId!),
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
