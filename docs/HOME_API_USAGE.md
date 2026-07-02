# Home Screen API Usage

This document describes how the mobile home screen loads backend data. Verify against code before relying on any detail. An earlier version of this document described a `useHomeScreen` hook family (`useHomeBanners`, `useHomeCategories`, `useHomeCollections`, `useHomeCalloutBanners`, `useRefreshHomeScreen`) that does not exist in the codebase; that content was removed.

## Current State

Current state: Home screen data comes from the Cartaisy backend endpoint `GET /customer/homescreen` through the Orval-generated client in `api/generated/customer-homescreen/`.

Current state: `api/hooks/useHomeScreenData.ts` is a thin re-export of the generated hook and response type:

```typescript
export { useGetHomescreenData as useHomeScreenData } from "@/api/generated/customer-homescreen/customer-homescreen";
export type { HomescreenDataResponse as HomeScreenData } from "@/api/generated/cartaisyAPI.schemas";
```

Current state: `app/(tabs)/index.tsx` calls `useHomeScreenData()` and builds its sections dynamically from the response's `layout` array. Supported layout types include carousel, promo banners, callout banners, category grid, collection displays, collection showcases, and category collection grid. If the backend returns no layout, the screen falls back to a default section order, and sections without data are skipped.

Current state: Pull-to-refresh uses the hook's `refetch`; there is no separate refresh mutation hook.

Current state: Requests go through the shared Axios client, so they include store scoping (`X-Store-ID`) and session/auth headers like other backend calls.

## Known Gaps

Known gap: `store/useHomeScreenStore.ts` exists but is not imported by any screen or component. Home screen data flows through React Query, not Zustand.

Known gap: Exact section content depends on tenant data returned by the backend. Do not assume every layout type has data for every store.

## Unknowns

Unknown: Backend API contract freshness. The generated client comes from `api-spec/swagger.json`; verify the spec matches the deployed backend before extending home surfaces.

## Related Docs And Issues

- `api/hooks/useHomeScreenData.ts`
- `app/(tabs)/index.tsx`
- `docs/ARCHITECTURE.md`
- `docs/STATUS.md`
