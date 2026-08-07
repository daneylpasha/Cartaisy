import useStoreConfigStore from "@/store/useStoreConfigStore";

/**
 * Returns the merchant's real store name, or an empty string when it isn't
 * available yet — before the `/store/config` fetch resolves
 * (`AppInitializer.tsx` defers it 500ms), after a failed fetch (which
 * explicitly resets `storeName` back to `""`, not the previous value — see
 * `AppInitializer.tsx`'s catch block), or if a store genuinely has no name
 * set. See TICKETwiremerchantstorenameintocompanynamestrings.md.
 *
 * Deliberately does NOT fall back to the bundled "Cartaisy" translation
 * (`common.companyName`) the way an earlier version of this hook did.
 * `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`'s "Physical Device Install
 * Verification" section documents an existing, already-verified product
 * requirement: other backend-driven surfaces (`/store/config` store name,
 * catalog load) fail closed to an empty/error state rather than leaking
 * Cartaisy branding. Showing "Cartaisy" to a merchant's own customers on
 * their own branded build — because their store-name fetch hasn't resolved
 * or failed — is exactly that leak: a different company's name shown in
 * place of theirs, not a safe generic default (unlike `primaryColor`/
 * `secondaryColor`, where falling back to Cartaisy's own color tokens is
 * cosmetically neutral).
 *
 * Each of the five call sites decides its own empty-state UI treatment
 * instead of this hook baking one in: search-surfaces (SearchBar,
 * SearchInput, HomeHeader) fall back to a bare "Search" placeholder with no
 * name; identity-surfaces (notification.tsx, wellcome.tsx) hide the name
 * text entirely rather than showing a blank space or leaking "Cartaisy".
 *
 * Unlike `primaryColor`/`secondaryColor`, `storeName` is plain text read
 * directly from the store, not a Tamagui theme token — it doesn't need
 * `updateTheme()`/`useTheme()` wiring. zustand's own subscription already
 * makes a consuming component re-render when `storeName` changes (e.g.
 * once the startup fetch resolves after this component already mounted).
 */
export function useCompanyName(): string {
  return useStoreConfigStore((state) => state.storeName);
}
