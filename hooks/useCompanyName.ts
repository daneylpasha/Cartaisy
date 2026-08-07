import useStoreConfigStore from "@/store/useStoreConfigStore";
import { t } from "@/translations";

/**
 * Returns the merchant's real store name, falling back to the bundled
 * "Cartaisy" translation (`common.companyName` in translations/en.json)
 * whenever `storeName` is empty — before the `/store/config` fetch resolves
 * (`AppInitializer.tsx` defers it 500ms), on a failed fetch (which
 * explicitly sets `storeName: ""`, not the previous value — see
 * `AppInitializer.tsx`'s catch block), or if a store genuinely has no name
 * set. See TICKETwiremerchantstorenameintocompanynamestrings.md.
 *
 * Five UI locations previously read the hardcoded `t("common.companyName")`
 * directly instead of the merchant's actual `storeName` (already fetched
 * and available via `useStoreConfigStore`) — this hook centralizes the
 * store-read + fallback so each of the five doesn't hand-roll the same
 * `storeName || t("common.companyName")` expression, mirroring how
 * `useReactiveTokenColor.ts` centralized the equivalent reactive-color
 * read/fallback pattern for PR #118's five components.
 *
 * Unlike `primaryColor`/`secondaryColor`, `storeName` is plain text read
 * directly from the store, not a Tamagui theme token — it doesn't need
 * `updateTheme()`/`useTheme()` wiring. zustand's own subscription already
 * makes a consuming component re-render when `storeName` changes (e.g.
 * once the startup fetch resolves after this component already mounted
 * with the bundled fallback).
 */
export function useCompanyName(): string {
  const storeName = useStoreConfigStore((state) => state.storeName);
  return storeName || t("common.companyName");
}
