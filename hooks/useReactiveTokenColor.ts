import { useTheme } from "tamagui";

import { tokens } from "@/tamagui/token";

type ColorToken = keyof typeof tokens.color;

// Color tokens that are also registered as Tamagui *theme* keys (see
// tamagui/theme.ts) — the only ones useDynamicPrimaryTheme.ts /
// useDynamicSecondaryTheme.ts ever mutate via updateTheme(). Every other
// tokens.color entry (white, black, error, grey, ...) is a plain static
// design token that never changes at runtime, so there's nothing to
// subscribe to for those — reading tokens.color directly for them is
// correct, not a bug.
const REACTIVE_THEME_COLOR_KEYS = new Set<string>([
  "primary",
  "primarylight",
  "secondary",
]);

/**
 * Returns a `getTokenValue(token)`-shaped resolver for `tokens.color` that's
 * actually reactive for the tokens that can change at runtime.
 *
 * The root cause this fixes (see docs/STATUS.md's reactivity-gap paragraph
 * and TICKETmobilereactivitygapsharedprimitives.md): `OpTouch`, `SecondaryButton`,
 * `FormInput`, and `AppImage` each read `tokens.color.primary`/`.secondary`
 * directly — a plain object snapshot taken once at import time, not a
 * subscription. `updateTheme()` (the mechanism behind
 * hooks/useDynamicPrimaryTheme.ts / useDynamicSecondaryTheme.ts) mutates
 * Tamagui's live *theme* registry and forces every `useTheme()` consumer to
 * re-render (see @tamagui/web's useThemeState.ts -> forceUpdateThemes()) —
 * but a component that never called `useTheme()` in the first place was
 * never subscribed, so it never re-renders.
 *
 * This hook calls `useTheme()` once (same Rules-of-Hooks constraints as any
 * other hook — call it unconditionally at the top of the consuming
 * component) and returns a plain resolver function shaped like the local
 * `getTokenValue()`/`resolveTokenColor()` helpers it replaces, so each call
 * site can swap its resolution logic for this with a minimal surrounding
 * change instead of rewriting its render output.
 *
 * `primary`/`primarylight`/`secondary` resolve through the live theme (so
 * they pick up a merchant color the instant `updateTheme()` fires, no
 * restart or rebuild needed). Every other color token resolves from the
 * static `tokens.color` object, same as before — correct, since those never
 * vary at runtime and Tamagui's theme registry doesn't even carry them (only
 * `primary`/`primarylight`/`secondary`/`color`/`surface`/`border` are
 * registered theme keys — see tamagui/theme.ts).
 */
export function useReactiveTokenColor() {
  const theme = useTheme();

  return (token: string | undefined): string | undefined => {
    if (!token) return undefined;
    const cleanToken = token.startsWith("$") ? token.slice(1) : token;

    if (REACTIVE_THEME_COLOR_KEYS.has(cleanToken)) {
      const themeValue = theme?.[cleanToken as keyof typeof theme] as
        | { get?: () => unknown; val?: unknown }
        | undefined;
      const resolved = themeValue?.get ? themeValue.get() : themeValue?.val;
      if (typeof resolved === "string") {
        return resolved;
      }
      // Theme not ready yet (e.g. first render before TamaguiProvider
      // finishes mounting) — fall through to the static default below
      // rather than returning undefined, matching every static resolver's
      // existing fallback-to-bundled-color behavior.
    }

    return tokens.color[cleanToken as ColorToken];
  };
}
