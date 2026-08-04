import {
  getContrastRatio,
  getRelativeLuminance,
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
    // Same 4.5:1-against-white threshold as primary, but checked because
    // $secondary is used as *foreground* text/icon color on the app's fixed
    // near-white surfaces ($white, $background, $surface, $errorbg) — see
    // the comment on MIN_SECONDARY_ON_WHITE_CONTRAST in colorUtils.ts.
    it("accepts the bundled Cartaisy secondary gray (rgb(75,85,99), well above 4.5:1 against white)", () => {
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

    it("rejects a mid-tone color below the 4.5:1 AA threshold (e.g. a bright green at ~3.08:1)", () => {
      expect(hasSufficientContrastForSecondary("#00A86B")).toBe(false);
    });
  });
});
