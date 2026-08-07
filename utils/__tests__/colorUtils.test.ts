import {
  compositeOverBackground,
  getContrastRatio,
  getPrimaryLight,
  getRelativeLuminance,
  hasSufficientContrastAgainstPrimaryLight,
  hasSufficientContrastForPrimary,
  hasSufficientContrastForSecondary,
  lightenColor,
} from "@/utils/colorUtils";

describe("colorUtils contrast helpers", () => {
  describe("getRelativeLuminance", () => {
    it("returns 1 for white and 0 for black", () => {
      expect(getRelativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
      expect(getRelativeLuminance("#000000")).toBeCloseTo(0, 5);
    });

    it("returns null for an unparseable hex string", () => {
      expect(getRelativeLuminance("not-a-color")).toBeNull();
    });

    // 3-digit shorthand support (TICKETmobileaccept3digithexbrandingcolors.md):
    // hexToRgb() must expand shorthand before parsing, or every consumer of
    // getRelativeLuminance (getContrastRatio and everything built on it)
    // would silently treat a now-validated 3-digit hex as unparseable.
    it("expands a 3-digit shorthand hex the same as its 6-digit equivalent", () => {
      expect(getRelativeLuminance("#FFF")).toBeCloseTo(
        getRelativeLuminance("#FFFFFF") as number,
        10,
      );
      expect(getRelativeLuminance("#000")).toBeCloseTo(
        getRelativeLuminance("#000000") as number,
        10,
      );
      expect(getRelativeLuminance("#ABC")).toBeCloseTo(
        getRelativeLuminance("#AABBCC") as number,
        10,
      );
    });

    it("still returns null for near-3-digit malformed input", () => {
      expect(getRelativeLuminance("#AB")).toBeNull(); // too short
      expect(getRelativeLuminance("#ABCDE")).toBeNull(); // too long for either form
      expect(getRelativeLuminance("#GGG")).toBeNull(); // non-hex characters
    });
  });

  describe("getContrastRatio", () => {
    it("returns 21 for black-on-white, the WCAG maximum", () => {
      expect(getContrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    });

    it("returns 1 for identical colors", () => {
      expect(getContrastRatio("#A82A50", "#A82A50")).toBeCloseTo(1, 5);
    });

    it("is symmetric regardless of argument order", () => {
      const a = getContrastRatio("#A82A50", "#FFFFFF");
      const b = getContrastRatio("#FFFFFF", "#A82A50");
      expect(a).toBeCloseTo(b as number, 5);
    });

    it("returns null if either color fails to parse", () => {
      expect(getContrastRatio("nope", "#FFFFFF")).toBeNull();
    });

    it("returns 21 for 3-digit black-on-white, same as the 6-digit form", () => {
      expect(getContrastRatio("#000", "#FFF")).toBeCloseTo(21, 1);
    });
  });

  describe("hasSufficientContrastForPrimary", () => {
    it("accepts the bundled Cartaisy primary color (dark magenta, ~6.75:1 against white)", () => {
      expect(hasSufficientContrastForPrimary("#A82A50")).toBe(true);
    });

    it("accepts a dark, clearly-legible merchant color", () => {
      expect(hasSufficientContrastForPrimary("#123456")).toBe(true);
    });

    it("rejects white — a merchant color identical to the fixed white button text", () => {
      expect(hasSufficientContrastForPrimary("#FFFFFF")).toBe(false);
    });

    it("rejects near-white / light pastel colors that would make white text unreadable", () => {
      expect(hasSufficientContrastForPrimary("#F5F5F5")).toBe(false);
      expect(hasSufficientContrastForPrimary("#FFEEDD")).toBe(false);
      expect(hasSufficientContrastForPrimary("#CCCCCC")).toBe(false);
    });

    it("rejects a mid-tone color below the 4.5:1 AA threshold (e.g. a bright green at ~3.08:1)", () => {
      expect(hasSufficientContrastForPrimary("#00A86B")).toBe(false);
    });

    it("accepts a dark 3-digit shorthand color, matching its 6-digit equivalent (TICKETmobileaccept3digithexbrandingcolors.md)", () => {
      expect(hasSufficientContrastForPrimary("#123")).toBe(true);
    });

    it("rejects a near-white 3-digit shorthand color the same as its 6-digit equivalent", () => {
      expect(hasSufficientContrastForPrimary("#eee")).toBe(false);
    });
  });

  describe("hasSufficientContrastForSecondary", () => {
    // Same 4.5:1 threshold as primary, but checked against $background
    // (#F8FAFC), not white — see the comment on
    // MIN_SECONDARY_ON_BACKGROUND_CONTRAST in colorUtils.ts for why $background
    // (lower luminance than white) is the correct, stricter reference.
    it("accepts the bundled Cartaisy secondary gray (rgb(75,85,99), well above 4.5:1 against $background)", () => {
      expect(hasSufficientContrastForSecondary("#4B5563")).toBe(true);
    });

    it("accepts a dark, clearly-legible merchant color", () => {
      expect(hasSufficientContrastForSecondary("#123456")).toBe(true);
    });

    it("rejects white — a merchant secondary color identical to the fixed near-white surfaces it's rendered on", () => {
      expect(hasSufficientContrastForSecondary("#FFFFFF")).toBe(false);
    });

    it("rejects near-white / light pastel colors that would make the text/icon invisible", () => {
      expect(hasSufficientContrastForSecondary("#F5F5F5")).toBe(false);
      expect(hasSufficientContrastForSecondary("#FFEEDD")).toBe(false);
      expect(hasSufficientContrastForSecondary("#CCCCCC")).toBe(false);
    });

    it("rejects a mid-tone color below the 4.5:1 AA threshold (e.g. a bright green at ~3.08:1 against $background)", () => {
      expect(hasSufficientContrastForSecondary("#00A86B")).toBe(false);
    });

    it("rejects a color that passes against white but fails against the real $background surface (caught in Codex review)", () => {
      // #767676 is ~4.54:1 against #FFFFFF (would incorrectly pass a
      // white-only check) but only ~4.34:1 against #F8FAFC, the actual
      // $background surface confirmed live behind $secondary text in
      // app/changePassword.tsx and app/ordersDetails.tsx. This is the
      // regression test for that bug.
      expect(hasSufficientContrastForSecondary("#767676")).toBe(false);
    });

    it("accepts a dark 3-digit shorthand color, matching its 6-digit equivalent (TICKETmobileaccept3digithexbrandingcolors.md)", () => {
      expect(hasSufficientContrastForSecondary("#123")).toBe(true);
    });

    it("rejects a near-white 3-digit shorthand color the same as its 6-digit equivalent", () => {
      expect(hasSufficientContrastForSecondary("#eee")).toBe(false);
    });
  });

  describe("lightenColor / getPrimaryLight with 3-digit shorthand input (TICKETmobileaccept3digithexbrandingcolors.md)", () => {
    // $primarylight is derived from the merchant's primaryColor via
    // lightenColor() -> hexToRgb(). If a validated 3-digit primaryColor
    // failed to parse here, $primarylight would silently fall back to the
    // raw unparsed hex (hexToRgb returning null makes lightenColor return
    // its input unchanged) instead of an actual lightened/translucent color.
    it("produces the same lightened output for a 3-digit hex as its 6-digit equivalent", () => {
      expect(lightenColor("#000")).toBe(lightenColor("#000000"));
      expect(getPrimaryLight("#000")).toBe(getPrimaryLight("#000000"));
    });

    it("returns the input unchanged when it fails to parse, same fallback as the existing 6-digit-only behavior", () => {
      expect(lightenColor("not-a-color")).toBe("not-a-color");
    });
  });

  describe("compositeOverBackground", () => {
    it("treats a fully opaque 6-digit hex as itself, regardless of the backdrop", () => {
      expect(compositeOverBackground("#A82A50", "#FFFFFF")).toBe("#a82a50");
      expect(compositeOverBackground("#A82A50", "#000000")).toBe("#a82a50");
    });

    it("resolves a fully transparent color (00 alpha) to exactly the backdrop", () => {
      expect(compositeOverBackground("#12345600", "#F8FAFC")).toBe("#f8fafc");
    });

    it("alpha-composites $primarylight derived from black over white and $background, matching the values Codex cited", () => {
      // getPrimaryLight("#000000") -> "#9999994d" (60% lighter, 30% opacity).
      // Reproduced live and confirmed against the Codex finding's own numbers.
      expect(compositeOverBackground("#9999994d", "#FFFFFF")).toBe("#e0e0e0");
      expect(compositeOverBackground("#9999994d", "#F8FAFC")).toBe("#dbddde");
    });

    it("returns null when either input fails to parse", () => {
      expect(compositeOverBackground("not-a-color", "#FFFFFF")).toBeNull();
      expect(compositeOverBackground("#9999994d", "not-a-color")).toBeNull();
    });
  });

  describe("hasSufficientContrastAgainstPrimaryLight", () => {
    it("accepts a dark secondaryColor against the $primarylight derived from a dark primaryColor", () => {
      expect(
        hasSufficientContrastAgainstPrimaryLight("#123456", "#000000")
      ).toBe(true);
    });

    it("rejects the exact reproducing case from Codex's finding: secondaryColor #737373 against primaryColor #000000's derived $primarylight (~3.48:1, well under 4.5:1)", () => {
      expect(
        hasSufficientContrastAgainstPrimaryLight("#737373", "#000000")
      ).toBe(false);
    });

    it("catches a secondaryColor that the flat $background check alone would incorrectly accept", () => {
      // #737373 clears the flat $background check (~4.53:1) but fails once
      // $primarylight (derived from primaryColor #000000) is also checked —
      // this is precisely the gap Codex's finding closed.
      expect(hasSufficientContrastForSecondary("#737373")).toBe(true);
      expect(
        hasSufficientContrastAgainstPrimaryLight("#737373", "#000000")
      ).toBe(false);
    });

    it("gives the same result for a 3-digit primaryColor as its 6-digit equivalent (TICKETmobileaccept3digithexbrandingcolors.md)", () => {
      expect(hasSufficientContrastAgainstPrimaryLight("#123456", "#000")).toBe(
        hasSufficientContrastAgainstPrimaryLight("#123456", "#000000"),
      );
    });
  });
});
