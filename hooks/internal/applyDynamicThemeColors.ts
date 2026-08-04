import { updateTheme } from "tamagui";

export const THEME_NAMES = ["light", "dark"] as const;

/**
 * Shared primitive behind useDynamicPrimaryTheme and
 * useDynamicSecondaryTheme: applies a partial theme patch to both the
 * `light` and `dark` registered Tamagui themes via `updateTheme` — the same
 * public runtime-theming API that already powers this app's light/dark mode
 * switching (see useDynamicPrimaryTheme.ts's doc comment for the full
 * mechanism/native-safety writeup; not repeated per call site).
 *
 * Pulled out so both color hooks share one implementation of "apply this
 * patch to every registered theme" rather than each duplicating the
 * `for (const name of THEME_NAMES) updateTheme(...)` loop. Each hook still
 * owns its own store subscription, its own bundled-color fallback, and its
 * own "skip if unchanged" guard — only the actual theme-mutation call is
 * shared here.
 */
export function applyDynamicThemeColors(themePatch: Record<string, string>) {
  for (const name of THEME_NAMES) {
    updateTheme({ name, theme: themePatch });
  }
}
