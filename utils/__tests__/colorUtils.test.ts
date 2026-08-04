import {
  compositeOverBackground,
  getContrastRatio,
  getRelativeLuminance,
  hasSufficientContrastAgainstPrimaryLight,
  hasSufficientContrastForPrimary,
  hasSufficientContrastForSecondary,
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
  });
});
