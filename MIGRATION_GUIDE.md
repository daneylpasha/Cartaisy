# API Migration Guide - Shopify Integration

## ✅ Completed Migration Tasks

### 1. Orval Setup & API Client Generation
- **Installed**: `orval@7.13.0` for type-safe API client generation
- **Configuration**: `orval.config.ts` configured to use local `./api-spec/swagger.json`
- **Generated Files**:
  - `api/generated/cartaisyAPI.schemas.ts` - All TypeScript types
  - `api/generated/homescreen/homescreen.ts` - Homescreen React Query hooks
  - `api/generated/favorites/favorites.ts` - Favorites React Query hooks

### 2. API Client Configuration
- **File**: `api/apiClient.ts`
- **Backend URL**: `http://192.168.18.101:3000/api/v1`
- **Features**:
  - Automatic JWT token injection from Zustand auth store
  - 401 error handling with automatic logout (for JWT secret change)
  - Custom axios instance for Orval

### 3. Migrated Components & Types

#### Updated Field Mappings:
- `CarouselItem`:
  - `subTitle` → `subtitle` ✅
  - `buttonText` → `ctaText` ✅
  - `collectionId`: `number` → `string` ✅
  - Added: `endsAt`, `promoTag`

- `Product`:
  - `availableForSale` → `inStock` ✅
  - `stockQuantity` → `availableQuantity` ✅
  - Added: `rating`, `reviewsCount`, `compareAtPrice`

#### Updated Components:
- ✅ `components/organisms/home/FeaturedPromotionsCarousel.tsx`
- ✅ `components/organisms/home/CalloutBanners.tsx`
- ✅ `components/organisms/home/PromoBannerCard.tsx`
- ✅ `api/hooks/useHomeScreenData.ts` - Now exports Orval-generated hooks

### 4. New Favorites Feature

#### Created Files:
- `store/useFavoritesStore.ts` - Zustand store for favorites state
- `api/hooks/useFavorites.ts` - Custom hooks with optimistic updates
- `components/molecules/FavoriteButton.tsx` - Heart button component

#### Features:
- JWT-protected API calls
- Optimistic UI updates
- Automatic rollback on error
- Haptic feedback on toggle

### 5. New UI Components

#### Product Rating Component
- **File**: `components/molecules/ProductRating.tsx`
- **Features**: Star display, rating number, review count

#### Discount Badge Component
- **File**: `components/molecules/DiscountBadge.tsx`
- **Features**:
  - Discount percentage badge
  - Price with strikethrough for compareAtPrice
  - Only shows when there's an actual discount

---

## 📖 Usage Examples

### 1. Using the Homescreen API

```tsx
import { useHomeScreenData } from '@/api/hooks/useHomeScreenData';

function HomeScreen() {
  const { data, isLoading, error } = useHomeScreenData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} />;

  return (
    <ScrollView>
      <FeaturedPromotionsCarousel item={data?.data?.carousel} />
      <CalloutBanners calloutBanners={data?.data?.calloutBanners} />
      <PromoBannerCard promoBanners={data?.data?.promoBanners} />
    </ScrollView>
  );
}
```

### 2. Using Favorites

```tsx
import { useFavorites } from '@/api/hooks/useFavorites';
import { FavoriteButton } from '@/components/molecules/FavoriteButton';

function ProductCard({ product }) {
  const { toggleFavorite, isAddingFavorite, isRemovingFavorite } = useFavorites();

  return (
    <View>
      <Image source={{ uri: product.images[0] }} />

      {/* Heart button in top-right corner */}
      <FavoriteButton
        productId={product.productId}
        onToggle={toggleFavorite}
        isLoading={isAddingFavorite || isRemovingFavorite}
      />

      <Text>{product.title}</Text>
    </View>
  );
}
```

### 3. Using Product Rating

```tsx
import { ProductRating } from '@/components/molecules/ProductRating';
import type { Product } from '@/api/generated/cartaisyAPI.schemas';

function ProductDetails({ product }: { product: Product }) {
  return (
    <View>
      <ProductRating
        rating={product.rating}
        reviewsCount={product.reviewsCount}
        size="medium"
        showReviewCount={true}
      />
    </View>
  );
}
```

### 4. Using Discount Badge

```tsx
import { DiscountBadge, PriceWithDiscount } from '@/components/molecules/DiscountBadge';
import type { Product } from '@/api/generated/cartaisyAPI.schemas';

function ProductPrice({ product }: { product: Product }) {
  return (
    <View>
      {/* Discount badge (only shows if compareAtPrice exists) */}
      <DiscountBadge
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        currency={product.currency}
      />

      {/* Price display with strikethrough */}
      <PriceWithDiscount
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        currency={product.currency}
      />
    </View>
  );
}
```

### 5. Complete Product Card Example

```tsx
import type { Product } from '@/api/generated/cartaisyAPI.schemas';
import { FavoriteButton } from '@/components/molecules/FavoriteButton';
import { ProductRating } from '@/components/molecules/ProductRating';
import { DiscountBadge, PriceWithDiscount } from '@/components/molecules/DiscountBadge';
import { useFavorites } from '@/api/hooks/useFavorites';

function EnhancedProductCard({ product }: { product: Product }) {
  const { toggleFavorite, isAddingFavorite, isRemovingFavorite } = useFavorites();

  return (
    <View style={styles.card}>
      {/* Product Image with Favorite Button */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.image} />

        {/* Discount Badge - Top Left */}
        <View style={styles.discountBadge}>
          <DiscountBadge
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />
        </View>

        {/* Favorite Button - Top Right */}
        <View style={styles.favoriteButton}>
          <FavoriteButton
            productId={product.productId}
            onToggle={toggleFavorite}
            isLoading={isAddingFavorite || isRemovingFavorite}
          />
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.title}>{product.title}</Text>

        {/* Rating */}
        <ProductRating
          rating={product.rating}
          reviewsCount={product.reviewsCount}
          size="small"
        />

        {/* Price */}
        <PriceWithDiscount
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          currency={product.currency}
        />

        {/* Stock Status */}
        <Text style={styles.stock}>
          {product.inStock
            ? `In Stock (${product.availableQuantity})`
            : 'Out of Stock'}
        </Text>
      </View>
    </View>
  );
}
```

---

## 🔄 Regenerating API Client

Whenever the backend API changes, regenerate the client:

```bash
npm run generate:api
```

This will:
1. Read `api-spec/swagger.json`
2. Generate TypeScript types in `api/generated/cartaisyAPI.schemas.ts`
3. Generate React Query hooks for all endpoints

---

## ⚠️ Important Notes

### JWT Authentication
- All users must re-login due to JWT secret change on backend
- The `apiClient.ts` automatically handles 401 errors by clearing auth state
- Favorites API requires authentication

### Type Safety
- **Always** import types from `@/api/generated/cartaisyAPI.schemas`
- Use generated hooks from `@/api/generated/*`
- Never manually type API responses - let Orval generate them

### Backend URL
- Current: `http://192.168.18.101:3000/api/v1`
- Update in `api/apiClient.ts` if backend moves to different IP

---

## 🎯 Next Steps (Optional Enhancements)

1. **Persist Favorites**: Add AsyncStorage persistence to `useFavoritesStore`
2. **Login Prompt**: Show login modal when unauthenticated users try to favorite
3. **Toast Notifications**: Add success/error toasts for favorite actions
4. **Skeleton Loading**: Add skeleton screens for better loading UX
5. **Error Boundaries**: Wrap components with error boundaries for graceful failures

---

## 🐛 Troubleshooting

### "Cannot find module '@/api/generated/...'"
Run: `npm run generate:api`

### 401 Errors on All API Calls
- User needs to re-login (JWT secret changed)
- Check if token exists in Zustand: `useAuthStore.getState().token`

### Favorites Not Persisting
- Verify user is authenticated
- Check network tab for API responses
- Ensure backend URL is correct

---

## 📚 API Reference

Generated types available in `api/generated/cartaisyAPI.schemas.ts`:
- `HomescreenResponse`, `HomescreenData`
- `Product`, `CarouselItem`, `CalloutBannerItem`, `PromoBannerItem`
- `Collection`, `CollectionDisplay`
- `FavoritesResponse`, `FavoriteRequest`, `FavoriteOperationResponse`

Generated hooks:
- `useGetHomescreenData()` - GET /customer/homescreen
- `useGetFavorites()` - GET /customer/favorites (JWT required)
- `useAddFavorite()` - POST /customer/favorites (JWT required)
- `useRemoveFavorite()` - DELETE /customer/favorites/:id (JWT required)
