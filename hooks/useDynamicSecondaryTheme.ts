import { useEffect, useRef } from "react";

import { applyDynamicThemeColors } from "@/hooks/internal/applyDynamicThemeColors";
import { SECONDARY_COLOR as STATIC_SECONDARY_COLOR } from "@/tamagui/token";
import useStoreConfigStore from "@/store/useStoreConfigStore";

/**
 * Applies the merchant's runtime `secondaryColor` (from `GET /store/config`,
 * already validated — including a contrast guardrail, see
 * utils/brandingValidation.ts — and persisted by
 * AppInitializer/useStoreConfigStore) to the *live* Tamagui theme, so every
 * `$secondary` token reference resolved through a Tamagui style prop
 * (`color="$secondary"`, `tintColor="$secondary"`,
 * `placeholderTextColor="$secondary"`, etc.) reflects the merchant's
 * secondary brand color, not just the bundled neutral gray.
 *
 * Extends the exact mechanism PR #115 proved out for `primaryColor` — see
 * useDynamicPrimaryTheme.ts's doc comment for the full `updateTheme`
 * mechanism and native-safety writeup (not repeated here). The actual
 * `updateTheme` call is shared between both hooks via
 * hooks/internal/applyDynamicThemeColors.ts.
 *
 * Unlike `primary`, `secondary` has no derived "light" variant (there is no
 * `secondarylight` token/theme key), so this hook only ever patches the
 * single `secondary` theme key.
 *
 * Known boundary (not solved by this hook, same shape as primaryColor's):
 * a handful of call sites read the color via `getTokenValue("$secondary")`
 * as a plain, unsubscribed JS value (icon `tintColor` props on native image
 * components that can't take a Tamagui style prop) — those won't pick up a
 * merchant color without individual changes. See the PR description for the
 * full accounting.
 */
export function useDynamicSecondaryTheme() {
  const secondaryColor = useStoreConfigStore((state) => state.secondaryColor);
  const appliedColorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const nextColor = secondaryColor ?? STATIC_SECONDARY_COLOR;

    // No-op if this is already the applied color (e.g. an unrelated store
    // update re-ran this effect with the same secondaryColor).
    // forceUpdateThemes() re-renders every themed component in the tree, so
    // skip it when nothing actually changed.
    if (appliedColorRef.current === nextColor) {
      return;
    }
    appliedColorRef.current = nextColor;

    applyDynamicThemeColors({ secondary: nextColor });
  }, [secondaryColor]);
}
