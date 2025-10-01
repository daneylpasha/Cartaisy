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
  console.log(collectionData, "collectionData");
  console.log(productsData, "productsData");

  // Map products
  const mappedProducts =
    productsData.products?.map((product: any) => {
      const currentPrice = parseFloat(product.variants?.[0]?.price || "0");
      const originalPrice = parseFloat(
        product.variants?.[0]?.compare_at_price || "0"
      );

      return {
        id: product.id.toString(),
        title: product.title,
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
