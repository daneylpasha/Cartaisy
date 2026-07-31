/**
 * Validation helpers for the runtime branding fields (`primaryColor`,
 * `secondaryColor`, `logoUrl`) returned by `GET /store/config`.
 *
 * The backend already validates and sanitizes these fields before returning
 * them (malformed hex colors are omitted, `logoUrl` is omitted unless it's an
 * absolute http(s) URL — see docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md), but the
 * mobile app treats the network response as untrusted input anyway rather than
 * assuming today's backend behavior holds forever. Anything that fails
 * validation here is treated as absent (falls back to bundled branding), never
 * as a thrown error.
 */

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
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
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
    validated.primaryColor = raw.primaryColor;
  }
  if (isValidHexColor(raw.secondaryColor)) {
    validated.secondaryColor = raw.secondaryColor;
  }
  if (isValidLogoUrl(raw.logoUrl)) {
    validated.logoUrl = raw.logoUrl;
  }

  return validated;
}
