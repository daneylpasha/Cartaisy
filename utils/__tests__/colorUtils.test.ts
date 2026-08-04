import {
  getContrastRatio,
  getRelativeLuminance,
  hasSufficientContrastForPrimary,
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
});
