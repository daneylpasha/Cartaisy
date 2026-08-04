import {
  isValidHexColor,
  isValidLogoUrl,
  validateBranding,
} from "@/utils/brandingValidation";

describe("brandingValidation", () => {
  describe("isValidHexColor", () => {
    it("accepts a six-digit hex color", () => {
      expect(isValidHexColor("#A82A50")).toBe(true);
      expect(isValidHexColor("#000000")).toBe(true);
      expect(isValidHexColor("#ffffff")).toBe(true);
    });

    it("rejects malformed hex colors", () => {
      expect(isValidHexColor("#FFF")).toBe(false); // three-digit shorthand not supported
      expect(isValidHexColor("A82A50")).toBe(false); // missing leading #
      expect(isValidHexColor("#GGGGGG")).toBe(false); // non-hex characters
      expect(isValidHexColor("#A82A5")).toBe(false); // too short
      expect(isValidHexColor("#A82A500")).toBe(false); // too long
      expect(isValidHexColor("red")).toBe(false); // named color, not hex
    });

    it("rejects non-string and empty values", () => {
      expect(isValidHexColor(undefined)).toBe(false);
      expect(isValidHexColor(null)).toBe(false);
      expect(isValidHexColor("")).toBe(false);
      expect(isValidHexColor(123456)).toBe(false);
    });
  });

  describe("isValidLogoUrl", () => {
    it("accepts an absolute https URL", () => {
      expect(isValidLogoUrl("https://cdn.cartaisy.com/logo.png")).toBe(true);
    });

    it("rejects http — iOS release builds and Android's non-debug manifest both refuse cleartext, so a persisted http URL would silently fail to load", () => {
      expect(isValidLogoUrl("http://cdn.cartaisy.com/logo.png")).toBe(false);
    });

    it("rejects non-https protocols", () => {
      expect(isValidLogoUrl("ftp://cdn.cartaisy.com/logo.png")).toBe(false);
      expect(isValidLogoUrl("data:image/png;base64,AAAA")).toBe(false);
      expect(isValidLogoUrl("javascript:alert(1)")).toBe(false);
    });

    it("rejects relative paths and malformed URLs", () => {
      expect(isValidLogoUrl("/assets/logo.png")).toBe(false);
      expect(isValidLogoUrl("not a url")).toBe(false);
      expect(isValidLogoUrl("")).toBe(false);
    });

    it("rejects non-string and empty values", () => {
      expect(isValidLogoUrl(undefined)).toBe(false);
      expect(isValidLogoUrl(null)).toBe(false);
      expect(isValidLogoUrl(42)).toBe(false);
    });
  });

  describe("validateBranding — primaryColor contrast guardrail", () => {
    // Per docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md's accessibility
    // guardrails: the app pairs $primary backgrounds with fixed $white text
    // in its existing filled-action pattern, so a merchant color must have
    // enough contrast against white or it gets dropped like a malformed one.
    const devWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    afterEach(() => {
      devWarnSpy.mockClear();
    });

    it("keeps a well-formed, high-contrast primaryColor", () => {
      expect(validateBranding({ primaryColor: "#123456" })).toEqual({
        primaryColor: "#123456",
      });
    });

    it("drops a well-formed but low-contrast primaryColor (e.g. white) instead of persisting it", () => {
      expect(validateBranding({ primaryColor: "#FFFFFF" })).toEqual({});
    });

    it("logs a development warning when dropping for low contrast, not silently", () => {
      validateBranding({ primaryColor: "#FFFFFF" });
      expect(devWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("#FFFFFF"),
      );
    });

    it("still drops a low-contrast primaryColor even when secondaryColor and logoUrl are valid", () => {
      expect(
        validateBranding({
          primaryColor: "#F5F5F5",
          secondaryColor: "#4B5563",
          logoUrl: "https://cdn.cartaisy.com/logo.png",
        }),
      ).toEqual({
        secondaryColor: "#4B5563",
        logoUrl: "https://cdn.cartaisy.com/logo.png",
      });
    });
  });

  describe("validateBranding — secondaryColor contrast guardrail", () => {
    // Added alongside secondaryColor's dynamic-theme wiring: $secondary is
    // always foreground text/icon color in this app, rendered on fixed
    // near-white surfaces, so an equivalent (mirrored) contrast guardrail
    // applies here too — see the comment in validateBranding() and
    // colorUtils.ts's MIN_SECONDARY_ON_WHITE_CONTRAST.
    const devWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    afterEach(() => {
      devWarnSpy.mockClear();
    });

    it("keeps a well-formed, high-contrast secondaryColor", () => {
      expect(validateBranding({ secondaryColor: "#123456" })).toEqual({
        secondaryColor: "#123456",
      });
    });

    it("drops a well-formed but low-contrast secondaryColor (e.g. white) instead of persisting it", () => {
      expect(validateBranding({ secondaryColor: "#FFFFFF" })).toEqual({});
    });

    it("logs a development warning when dropping for low contrast, not silently", () => {
      validateBranding({ secondaryColor: "#FFFFFF" });
      expect(devWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("#FFFFFF"),
      );
    });

    it("still drops a low-contrast secondaryColor even when primaryColor and logoUrl are valid", () => {
      expect(
        validateBranding({
          primaryColor: "#A82A50",
          secondaryColor: "#F5F5F5",
          logoUrl: "https://cdn.cartaisy.com/logo.png",
        }),
      ).toEqual({
        primaryColor: "#A82A50",
        logoUrl: "https://cdn.cartaisy.com/logo.png",
      });
    });

    it("evaluates primaryColor and secondaryColor contrast independently — one failing doesn't affect the other", () => {
      expect(
        validateBranding({
          primaryColor: "#FFFFFF", // fails
          secondaryColor: "#123456", // passes
        }),
      ).toEqual({
        secondaryColor: "#123456",
      });

      expect(
        validateBranding({
          primaryColor: "#123456", // passes
          secondaryColor: "#FFFFFF", // fails
        }),
      ).toEqual({
        primaryColor: "#123456",
      });
    });
  });

  describe("validateBranding", () => {
    it("passes through all three fields when present and valid", () => {
      const result = validateBranding({
        primaryColor: "#A82A50",
        secondaryColor: "#4B5563",
        logoUrl: "https://cdn.cartaisy.com/stores/store-id/logo.png",
      });

      expect(result).toEqual({
        primaryColor: "#A82A50",
        secondaryColor: "#4B5563",
        logoUrl: "https://cdn.cartaisy.com/stores/store-id/logo.png",
      });
    });

    it("omits each field individually when absent, keeping the others", () => {
      expect(
        validateBranding({
          secondaryColor: "#4B5563",
          logoUrl: "https://cdn.cartaisy.com/logo.png",
        })
      ).toEqual({
        secondaryColor: "#4B5563",
        logoUrl: "https://cdn.cartaisy.com/logo.png",
      });

      expect(
        validateBranding({
          primaryColor: "#A82A50",
          logoUrl: "https://cdn.cartaisy.com/logo.png",
        })
      ).toEqual({
        primaryColor: "#A82A50",
        logoUrl: "https://cdn.cartaisy.com/logo.png",
      });

      expect(
        validateBranding({
          primaryColor: "#A82A50",
          secondaryColor: "#4B5563",
        })
      ).toEqual({
        primaryColor: "#A82A50",
        secondaryColor: "#4B5563",
      });
    });

    it("treats each malformed field as absent rather than throwing", () => {
      expect(() =>
        validateBranding({
          primaryColor: "not-a-color",
          secondaryColor: "#4B5563",
          logoUrl: "https://cdn.cartaisy.com/logo.png",
        })
      ).not.toThrow();

      expect(
        validateBranding({
          primaryColor: "not-a-color",
          secondaryColor: "#4B5563",
          logoUrl: "https://cdn.cartaisy.com/logo.png",
        })
      ).toEqual({
        secondaryColor: "#4B5563",
        logoUrl: "https://cdn.cartaisy.com/logo.png",
      });

      expect(
        validateBranding({
          primaryColor: "#A82A50",
          secondaryColor: "#4B5563",
          logoUrl: "not a url",
        })
      ).toEqual({
        primaryColor: "#A82A50",
        secondaryColor: "#4B5563",
      });
    });

    it("returns an empty object when nothing is present or valid", () => {
      expect(validateBranding({})).toEqual({});
      expect(
        validateBranding({
          primaryColor: "bad",
          secondaryColor: "bad",
          logoUrl: "bad",
        })
      ).toEqual({});
    });
  });
});
