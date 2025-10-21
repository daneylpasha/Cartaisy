# App Providers

This directory contains app-level provider components and initializers.

## AppInitializer

**Purpose**: Central component for initializing app-level features on launch.

**Location**: `components/providers/AppInitializer.tsx`

**Usage**: Already integrated in `app/_layout.tsx` inside `QueryClientProvider`.

### Current Features:
- ✅ **Favorites Initialization**: Fetches user favorites and syncs with Zustand store

### Adding New Initializations:

When you need to initialize a new app-level feature (e.g., user preferences, cart sync, analytics), add it to `AppInitializer.tsx`:

```typescript
// Example: Initialize user preferences
const { data: userPreferences } = useGetUserPreferences();

useEffect(() => {
  if (userPreferences) {
    console.log("🔥 [AppInitializer] User preferences loaded");
    usePreferencesStore.getState().setPreferences(userPreferences);
  }
}, [userPreferences]);
```

### Benefits:
- **Single Source**: All app initialization logic in one place
- **Clean Architecture**: Separation of concerns
- **Easy Debugging**: Console logs prefixed with `[AppInitializer]`
- **Scalable**: Add new features without cluttering `_layout.tsx`

### Rules:
1. ✅ Only use for **app-level** initialization (runs once on launch)
2. ✅ Must be called inside `QueryClientProvider` (for React Query hooks)
3. ✅ Should return `null` (purely for side effects)
4. ✅ Use descriptive console logs for debugging
5. ❌ Don't add UI rendering logic here
