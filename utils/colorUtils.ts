/**
 * Convert hex color to RGB. Accepts both 6-digit (`#RRGGBB`) and 3-digit
 * shorthand (`#RGB`) hex — shorthand is expanded to 6-digit (each nibble
 * doubled, e.g. `#ABC` -> `AABBCC`) before parsing, per the CSS hex-color
 * shorthand convention that `utils/brandingValidation.ts`'s
 * `isValidHexColor()` now also accepts (see
 * TICKETmobileaccept3digithexbrandingcolors.md). Without this, a validated
 * 3-digit primaryColor/secondaryColor would fail to parse here and every
 * contrast check consuming it (`getRelativeLuminance`, `getContrastRatio`,
 * and — via `lightenColor`/`getPrimaryLight` — the derived `$primarylight`
 * math) would silently misbehave on exactly the input this ticket makes
 * acceptable.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const stripped = hex.replace(/^#/, "");
  const expanded =
    /^[a-f\d]{3}$/i.test(stripped)
      ? stripped
          .split("")
          .map((c) => c + c)
          .join("")
      : stripped;

  const result = /^([a-f\d]{6})$/i.exec(expanded);
  return result
    ? {
        r: parseInt(result[1].slice(0, 2), 16),
        g: parseInt(result[1].slice(2, 4), 16),
        b: parseInt(result[1].slice(4, 6), 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Lighten a hex color by a percentage
 * @param hex - Hex color code (e.g., "#A82A50")
 * @param percent - Lightness increase (0-100). Default is 60
 * @param opacity - Opacity percentage (0-100). Default is 30 (very light/transparent)
 * @returns Lightened hex color with opacity
 */
export function lightenColor(hex: string, percent: number = 60, opacity: number = 30): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Increase RGB values to make it lighter (60-70% lighter)
  let r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)));
  let g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)));
  let b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)));

  // Convert opacity percentage to hex (30% = 0x4D)
  const opacityHex = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0");

  return rgbToHex(r, g, b) + opacityHex;
}

/**
 * Generate primary light color from primary color
 * @param primaryColor - Primary hex color
 * @returns Much lighter version of primary color with 30% opacity (very light & transparent)
 */
export function getPrimaryLight(primaryColor: string): string {
  return lightenColor(primaryColor, 60, 30); // 60% lighter, 30% opacity
}

/**
 * WCAG relative luminance of a single sRGB channel (0-255).
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * WCAG relative luminance of a hex color (0 = black, 1 = white).
 * Returns null for an unparseable hex string.
 */
export function getRelativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
}

/**
 * WCAG contrast ratio between two hex colors (1 = identical, 21 = max
 * black-on-white contrast). Returns null if either color fails to parse.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(hexA: string, hexB: string): number | null {
  const luminanceA = getRelativeLuminance(hexA);
  const luminanceB = getRelativeLuminance(hexB);
  if (luminanceA === null || luminanceB === null) return null;

  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.1 AA minimum contrast ratio for normal-weight/small text. The app's
// existing $primary-filled-action pattern (see e.g. the "OK" button in
// app/(tabs)/index.tsx) pairs a $primary background with fixed $white text,
// so this is checked against white specifically.
const MIN_PRIMARY_ON_WHITE_CONTRAST = 4.5;

/**
 * Whether a candidate primary color has enough contrast against white text
 * to stay legible on the app's existing $primary-background/$white-text
 * filled-action pattern (buttons, chips, etc.). Per
 * docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md's accessibility guardrails: a
 * merchant-supplied primary color that fails this check should not be
 * applied — the bundled default should be kept instead.
 */
export function hasSufficientContrastForPrimary(hex: string): boolean {
  const ratio = getContrastRatio(hex, "#FFFFFF");
  return ratio !== null && ratio >= MIN_PRIMARY_ON_WHITE_CONTRAST;
}

// WCAG 2.1 AA minimum contrast ratio for normal-weight/small text, same
// threshold as primary. $secondary has the opposite risk shape from
// $primary: it's never used as a background in this app (checked live —
// zero backgroundColor="$secondary" usages across ~64 consumer files), it's
// always the *foreground* — body/subdued text (`color="$secondary"`), icon
// tint (`tintColor="$secondary"` / `getTokenValue("$secondary")`), and
// placeholder text (`placeholderTextColor="$secondary"`) — rendered on top
// of the app's fixed light surfaces: $white/$surface (#FFFFFF), $background
// (#F8FAFC), $errorbg (#FFF1F2, not currently paired with $secondary text
// anywhere — checked live).
//
// Checked against $background (#F8FAFC), not white — caught in Codex review
// on this PR: #F8FAFC has *lower* luminance than #FFFFFF (0.9536 vs 1.0), so
// it's the stricter (harder-to-pass) reference of the two, not the looser
// one a naive "near white, so white should be conservative" assumption
// suggests. A color can clear 4.5:1 against white while landing under 4.5:1
// against $background — e.g. #767676 is ~4.54:1 against white but ~4.34:1
// against $background — and $background is confirmed live behind
// $secondary text (app/changePassword.tsx, app/ordersDetails.tsx). Checking
// against the lower-luminance surface is also sufficient on its own: for a
// darker foreground, a lower background luminance always yields a lower
// (stricter) ratio, so passing against $background implies passing against
// $white/$surface too — no need to check both.
const MIN_SECONDARY_ON_BACKGROUND_CONTRAST = 4.5;
const SECONDARY_CONTRAST_REFERENCE_SURFACE = "#F8FAFC"; // tokens.color.background

/**
 * Whether a candidate secondary color has enough contrast against the app's
 * $background surface to stay legible as foreground text/icon-tint (see the
 * comment above `MIN_SECONDARY_ON_BACKGROUND_CONTRAST`).
 */
export function hasSufficientContrastForSecondary(hex: string): boolean {
  const ratio = getContrastRatio(hex, SECONDARY_CONTRAST_REFERENCE_SURFACE);
  return ratio !== null && ratio >= MIN_SECONDARY_ON_BACKGROUND_CONTRAST;
}

/**
 * Alpha-composites a translucent `#RRGGBBAA` color (as produced by
 * `lightenColor`/`getPrimaryLight`) over an opaque backdrop, returning the
 * resulting opaque `#RRGGBB`. A plain 6-digit hex is treated as fully
 * opaque (composites to itself). Returns null if either input fails to
 * parse.
 */
export function compositeOverBackground(
  rgbaHex: string,
  backdropHex: string
): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    rgbaHex
  );
  const backdrop = hexToRgb(backdropHex);
  if (!match || !backdrop) return null;

  const fg = {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
  const alpha = match[4] ? parseInt(match[4], 16) / 255 : 1;

  const composite = (fgChannel: number, bgChannel: number) =>
    Math.round(fgChannel * alpha + bgChannel * (1 - alpha));

  return rgbToHex(
    composite(fg.r, backdrop.r),
    composite(fg.g, backdrop.g),
    composite(fg.b, backdrop.b)
  );
}

// Caught in Codex review on this PR: checking secondaryColor against a
// flat $background alone misses that $secondary also renders directly on
// top of $primarylight — a translucent overlay DERIVED FROM THE MERCHANT'S
// OWN primaryColor — on the payment-method screen's default-card "Expires"
// text (app/paymentMethod.tsx) and AddressCard's selected-address state
// (components/molecules/AddressCard.tsx, backgroundColor="$primarylight"
// when selected, with its $secondary address-line text rendered inside).
// $primarylight isn't a fixed color like $background — it depends on
// *both* merchant colors together, so it can't be captured by a single
// static reference the way the flat check above is. Reproduced live:
// primaryColor="#000000" -> $primarylight composited over $background is
// ~#DBDDDE; secondaryColor="#737373" clears the flat $background check
// (~4.53:1) but only reaches ~3.48:1 against that composite — confirmed
// with the exact numbers Codex's finding cited.
const MIN_SECONDARY_ON_PRIMARYLIGHT_CONTRAST = 4.5;

/**
 * Whether a candidate secondary color has enough contrast against the
 * $primarylight derived from a candidate (or bundled-fallback) primary
 * color, composited over $background — see the comment above
 * `MIN_SECONDARY_ON_PRIMARYLIGHT_CONTRAST`. `effectivePrimaryHex` should be
 * whatever primary color the live theme would actually be showing (the
 * validated merchant primaryColor, or the bundled default when there isn't
 * one) — not necessarily the same raw value being validated alongside this
 * secondaryColor.
 */
export function hasSufficientContrastAgainstPrimaryLight(
  secondaryHex: string,
  effectivePrimaryHex: string
): boolean {
  const primarylight = getPrimaryLight(effectivePrimaryHex);
  const composited = compositeOverBackground(
    primarylight,
    SECONDARY_CONTRAST_REFERENCE_SURFACE
  );
  if (!composited) return false;

  const ratio = getContrastRatio(secondaryHex, composited);
  return ratio !== null && ratio >= MIN_SECONDARY_ON_PRIMARYLIGHT_CONTRAST;
}
