/**
 * Validation helpers for the runtime branding fields (`primaryColor`,
 * `secondaryColor`, `logoUrl`) returned by `GET /store/config`.
 *
 * The backend already validates and sanitizes these fields before returning
 * them (malformed hex colors are omitted, `logoUrl` is omitted unless it's an
 * absolute URL — see docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md), but the
 * mobile app treats the network response as untrusted input anyway rather than
 * assuming today's backend behavior holds forever. Anything that fails
 * validation here is treated as absent (falls back to bundled branding), never
 * as a thrown error.
 */

import {
  hasSufficientContrastForPrimary,
  hasSufficientContrastForSecondary,
} from "@/utils/colorUtils";

// Six-digit hex colors only, matching the backend's `sanitizeHexColor`.
const HEX_COLOR_PATTERN = /^#[A-Fa-f0-9]{6}$/;

export function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value);
}

export function isValidLogoUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    // HTTPS only. An accepted http: URL would be silently unusable once a
    // future ticket actually renders it: iOS release builds set
    // NSAllowsArbitraryLoads to false and Android only allows cleartext
    // traffic in the debug manifest, so a persisted http: logoUrl would
    // simply fail to load in production. Matches the contract doc's own
    // "require HTTPS for remote assets outside development" guidance.
    return parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export interface RawBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface ValidatedBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

/**
 * Validate the branding fields on a raw `/store/config` response, dropping
 * any field that fails validation (missing or malformed) rather than
 * persisting it. The caller is responsible for deciding what happens to
 * previously persisted branding when a field comes back absent here — this
 * function only ever reports what's valid in the input it was given.
 */
export function validateBranding(raw: RawBranding): ValidatedBranding {
  const validated: ValidatedBranding = {};

  if (isValidHexColor(raw.primaryColor)) {
    // Accessibility guardrail from docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md:
    // the app's existing filled-action pattern (e.g. the "OK" button in
    // app/(tabs)/index.tsx) pairs a $primary background with fixed $white
    // text, so a merchant-supplied primary color that's too close to white
    // would make that text unreadable. A well-formed but low-contrast color
    // is treated the same as a malformed one here — omitted, not persisted
    // — so callers fall back to the bundled primary color. Only primaryColor
    // gets this check; secondaryColor isn't used in that fixed-white-text
    // pattern today.
    if (hasSufficientContrastForPrimary(raw.primaryColor)) {
      validated.primaryColor = raw.primaryColor;
    } else if (__DEV__) {
      console.warn(
        `[brandingValidation] primaryColor ${raw.primaryColor} has insufficient contrast against white text; keeping the bundled primary color instead.`
      );
    }
  }
  if (isValidHexColor(raw.secondaryColor)) {
    // Equivalent accessibility guardrail for secondaryColor, added when it
    // was wired into the dynamic theme (see hooks/useDynamicSecondaryTheme.ts).
    // $secondary has the mirror-image risk from $primary: it's never a
    // background in this app, it's always foreground text/icon-tint
    // rendered on the app's fixed near-white surfaces — so a near-white
    // secondaryColor would be just as illegible as a too-light primaryColor
    // was against fixed white button text. Same "drop it, keep the bundled
    // color, dev-warn" treatment. Checked against $background specifically
    // (not white) — see hasSufficientContrastForSecondary's comment in
    // colorUtils.ts for why white alone isn't the conservative choice it
    // looks like.
    if (hasSufficientContrastForSecondary(raw.secondaryColor)) {
      validated.secondaryColor = raw.secondaryColor;
    } else if (__DEV__) {
      console.warn(
        `[brandingValidation] secondaryColor ${raw.secondaryColor} has insufficient contrast against white text/icons; keeping the bundled secondary color instead.`
      );
    }
  }
  if (isValidLogoUrl(raw.logoUrl)) {
    validated.logoUrl = raw.logoUrl;
  }

  return validated;
}
