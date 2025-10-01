# HomeScreen API Usage Guide

## Setup Complete ✅

### 1. **Zustand Store** (`/store/useHomeScreenStore.ts`)
Global state for all homescreen data with types for:
- Banners
- Categories
- Products
- Collections
- Callout Banners

### 2. **React Query Hooks** (`/api/hooks/useHomeScreen.ts`)
Multiple hooks for different use cases:

## How to Use in Components

### Main HomeScreen Hook (All Data)
```typescript
import { useHomeScreen } from "@/api/hooks/useHomeScreen";

const HomeScreen = () => {
  const { data, isLoading, error, refetch } = useHomeScreen();

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <ScrollView>
      {/* All data available in 'data' */}
      <Banners data={data.banners} />
      <Categories data={data.categories} />
      <Products data={data.products} />
    </ScrollView>
  );
};
```

### Individual Component Hooks

#### For Banners Component
```typescript
import { useHomeBanners } from "@/api/hooks/useHomeScreen";

const BannersComponent = () => {
  const { banners, isLoading } = useHomeBanners();

  if (isLoading) return <Skeleton />;

  return (
    <FlatList
      data={banners}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Image source={{ uri: item.imageUrl }} />
      )}
    />
  );
};
```

#### For Categories Grid
```typescript
import { useHomeCategories } from "@/api/hooks/useHomeScreen";

const CategoriesGrid = () => {
  const { categories, isLoading } = useHomeCategories();

  return (
    <FlatList
      data={categories}
      numColumns={4}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <CategoryCard
          title={item.name}
          image={item.imageUrl}
        />
      )}
    />
  );
};
```

#### For Products Horizontal Scroller
```typescript
import { useHomeScreenProducts } from "@/api/hooks/useHomeScreen";

const ProductsHorizontalScroller = () => {
  const { products, isLoading, error } = useHomeScreenProducts();

  return (
    <FlatList
      data={products}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <ProductCard product={item} />
      )}
    />
  );
};
```

#### For Collections
```typescript
import { useHomeCollections } from "@/api/hooks/useHomeScreen";

const CollectionsSection = () => {
  const { collections, isLoading } = useHomeCollections();

  return (
    <FlatList
      data={collections}
      renderItem={({ item }) => (
        <CollectionCard
          title={item.title}
          image={item.imageUrl}
        />
      )}
    />
  );
};
```

#### For Callout Banners (Free Shipping Card)
```typescript
import { useHomeCalloutBanners } from "@/api/hooks/useHomeScreen";

const FreeShippingCard = () => {
  const { calloutBanners, isLoading } = useHomeCalloutBanners();

  const activeCallout = calloutBanners[0]; // First active banner

  if (!activeCallout) return null;

  return (
    <Card backgroundColor={activeCallout.backgroundColor}>
      <Text color={activeCallout.textColor}>
        {activeCallout.title}
      </Text>
      <Button onPress={() => navigate(activeCallout.action.navigateTo)}>
        {activeCallout.buttonText}
      </Button>
    </Card>
  );
};
```

### Pull to Refresh
```typescript
import { useRefreshHomeScreen } from "@/api/hooks/useHomeScreen";

const HomeScreen = () => {
  const { mutate: refresh, isLoading } = useRefreshHomeScreen();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => refresh()}
        />
      }
    >
      {/* Content */}
    </ScrollView>
  );
};
```

## Benefits

1. **Single API Call**: All home data in one request
2. **Cached Data**: 2 minutes cache for better performance
3. **Global State**: Access data anywhere via Zustand
4. **Type Safe**: Full TypeScript support
5. **Individual Hooks**: Use only what you need
6. **Auto Refresh**: Built-in refresh functionality
7. **Error Handling**: Proper error states
8. **Loading States**: Component-level loading

## API Response Structure
```json
{
  "success": true,
  "data": {
    "banners": [...],
    "categories": [...],
    "products": [...],
    "collections": [...],
    "calloutBanners": [...]
  }
}
```