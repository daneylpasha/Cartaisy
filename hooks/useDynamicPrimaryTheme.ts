import { useEffect, useRef } from "react";

import { applyDynamicThemeColors } from "@/hooks/internal/applyDynamicThemeColors";
import { PRIMARY_COLOR as STATIC_PRIMARY_COLOR } from "@/tamagui/token";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { getPrimaryLight } from "@/utils/colorUtils";

/**
 * Applies the merchant's runtime `primaryColor` (from `GET /store/config`,
 * already validated and persisted by AppInitializer/useStoreConfigStore) to
 * the *live* Tamagui theme, so every `$primary` / `$primarylight` token
 * reference resolved through a Tamagui style prop (`backgroundColor="$primary"`,
 * `color="$primary"`, etc.) reflects the merchant's brand color — not just
 * the handful of components that manually read the store and pass an inline
 * override (HomeHeader, LoginBottomSheet, login/signUp, addNewCardDetails).
 *
 * This is Tamagui's own public runtime-theming API (`updateTheme`, exported
 * from `@tamagui/theme` and re-exported by `tamagui`), not a workaround: it
 * mutates the registered theme object and calls `forceUpdateThemes()`, the
 * exact mechanism every themed component already subscribes to for
 * light/dark mode switching (see @tamagui/web's `useThemeState`). Confirmed
 * safe on React Native specifically — `@tamagui/theme` ships a dedicated
 * `.native.js` build (picked up automatically by Metro's platform
 * resolution) where the web-only CSS-insertion side effect is a no-op, so
 * nothing here reaches for `document` or any other DOM API.
 *
 * Known boundary (not solved by this hook): a separate set of call sites
 * read the color via `getTokenValue("$primary")` as a plain, unsubscribed
 * JS value (mostly for contexts a Tamagui style prop can't reach — Reanimated
 * worklets, `LoaderKitView`'s native `color` prop, etc.), e.g.
 * `PriceRangeSlider.tsx`. `updateTheme` only mutates the *theme* registry;
 * `getTokenValue` reads the separate, non-reactive *token* registry, so
 * those call sites won't pick up a merchant color without individual
 * changes — see the PR description for the full accounting.
 *
 * The actual `updateTheme` call is shared with useDynamicSecondaryTheme.ts
 * via hooks/internal/applyDynamicThemeColors.ts — this hook's own public
 * name, signature, and behavior are unchanged from when it shipped in
 * PR #115.
 */
export function useDynamicPrimaryTheme() {
  const primaryColor = useStoreConfigStore((state) => state.primaryColor);
  const appliedColorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const nextColor = primaryColor ?? STATIC_PRIMARY_COLOR;

    // No-op if this is already the applied color (e.g. an unrelated store
    // update re-ran this effect with the same primaryColor). forceUpdateThemes()
    // re-renders every themed component in the tree, so skip it when nothing
    // actually changed.
    if (appliedColorRef.current === nextColor) {
      return;
    }
    appliedColorRef.current = nextColor;

    const primarylight = getPrimaryLight(nextColor);

    applyDynamicThemeColors({ primary: nextColor, primarylight });
  }, [primaryColor]);
}
