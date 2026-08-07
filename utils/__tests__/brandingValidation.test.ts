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

    it("accepts a three-digit shorthand hex color, matching the backend's sanitizeHexColor (TICKETmobileaccept3digithexbrandingcolors.md)", () => {
      expect(isValidHexColor("#ABC")).toBe(true);
      expect(isValidHexColor("#000")).toBe(true);
      expect(isValidHexColor("#fff")).toBe(true);
    });

    it("rejects malformed hex colors", () => {
      expect(isValidHexColor("A82A50")).toBe(false); // missing leading #
      expect(isValidHexColor("#GGGGGG")).toBe(false); // non-hex characters, 6-digit length
      expect(isValidHexColor("#GGG")).toBe(false); // non-hex characters, 3-digit length
      expect(isValidHexColor("#AB")).toBe(false); // too short to be either form
      expect(isValidHexColor("#A82A5")).toBe(false); // too short for 6-digit, too long for 3-digit
      expect(isValidHexColor("#A82A500")).toBe(false); // too long
      expect(isValidHexColor("#ABCDE")).toBe(false); // 5 digits — neither valid length
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
    // colorUtils.ts's MIN_SECONDARY_ON_BACKGROUND_CONTRAST.
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

  describe("validateBranding — secondaryColor vs $primarylight cross-field guardrail", () => {
    // Caught in Codex review: $secondary also renders directly on top of
    // $primarylight (a translucent overlay derived from the *other*
    // merchant color) on app/paymentMethod.tsx's default-card "Expires"
    // text and AddressCard's selected-address state. A secondaryColor that
    // clears the flat $background check alone can still be illegible
    // against a particular primaryColor's derived overlay — see
    // hasSufficientContrastAgainstPrimaryLight in colorUtils.ts.
    const devWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    afterEach(() => {
      devWarnSpy.mockClear();
    });

    it("drops a secondaryColor that passes the flat $background check but fails against the submitted primaryColor's $primarylight", () => {
      // #737373 clears the flat $background check (~4.53:1) on its own —
      // see colorUtils.test.ts — but only reaches ~3.48:1 against the
      // $primarylight derived from primaryColor #000000. Exact reproducing
      // case from the Codex finding. primaryColor #000000 itself easily
      // clears its own white-text guardrail (~21:1), so it's kept — only
      // secondaryColor is dropped here.
      expect(
        validateBranding({
          primaryColor: "#000000",
          secondaryColor: "#737373",
        }),
      ).toEqual({
        primaryColor: "#000000",
      });
    });

    it("logs a development warning when dropping for insufficient $primarylight contrast", () => {
      validateBranding({ primaryColor: "#000000", secondaryColor: "#737373" });
      expect(devWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("#737373"),
      );
    });

    it("falls back to the bundled primary color as the effective $primarylight source when the submitted primaryColor itself is invalid", () => {
      // primaryColor "not-a-color" is malformed and dropped entirely, so the
      // secondaryColor check must fall back to the bundled STATIC_PRIMARY_COLOR
      // (#A82A50) rather than skipping the primarylight check altogether.
      // #123456 comfortably clears #A82A50's derived $primarylight (~10.1:1).
      expect(
        validateBranding({
          primaryColor: "not-a-color",
          secondaryColor: "#123456",
        }),
      ).toEqual({
        secondaryColor: "#123456",
      });
    });

    it("keeps a secondaryColor that passes both the flat $background check and the $primarylight check", () => {
      expect(
        validateBranding({
          primaryColor: "#A82A50",
          secondaryColor: "#4B5563",
        }),
      ).toEqual({
        primaryColor: "#A82A50",
        secondaryColor: "#4B5563",
      });
    });
  });

  describe("validateBranding — 3-digit hex shorthand (TICKETmobileaccept3digithexbrandingcolors.md)", () => {
    // Regression coverage for the gap this ticket closes: a merchant
    // primaryColor/secondaryColor of e.g. `#ABC` used to be accepted and
    // persisted by the backend, then silently rejected here with no error
    // shown — it just fell back to the bundled color. `#123` (-> expands to
    // `#112233`) is used as the passing case since it's dark enough to clear
    // every contrast guardrail by a wide margin, same as the existing
    // 6-digit `#123456` passing cases above.
    const devWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    afterEach(() => {
      devWarnSpy.mockClear();
    });

    it("accepts a well-formed, high-contrast 3-digit primaryColor and secondaryColor and flows them through unexpanded", () => {
      expect(
        validateBranding({ primaryColor: "#123", secondaryColor: "#123" }),
      ).toEqual({
        primaryColor: "#123",
        secondaryColor: "#123",
      });
    });

    it("drops a well-formed but low-contrast 3-digit primaryColor (e.g. #eee, expands to near-white) instead of persisting it", () => {
      expect(validateBranding({ primaryColor: "#eee" })).toEqual({});
      expect(devWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("#eee"),
      );
    });

    it("drops a well-formed but low-contrast 3-digit secondaryColor the same way", () => {
      expect(validateBranding({ secondaryColor: "#eee" })).toEqual({});
      expect(devWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("#eee"),
      );
    });

    it("still rejects malformed near-3-digit input — this ticket widens acceptance, it doesn't loosen it", () => {
      expect(validateBranding({ primaryColor: "#AB" })).toEqual({});
      expect(validateBranding({ primaryColor: "#ABCDE" })).toEqual({});
      expect(validateBranding({ primaryColor: "#GGG" })).toEqual({});
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
