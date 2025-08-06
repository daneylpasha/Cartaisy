import { createFont } from "tamagui";

export const figtreeFont = createFont({
  family: "Figtree",
  size: {
    1: 8,
    2: 10,
    3: 12,
    4: 14,
    5: 16,
    5.5: 18,
    6: 20,
    7: 24,
    8: 30,
    9: 32,
  },
  letterSpacing: {
    // Figma: -1.3% = -0.013em, -0.7% = -0.007em, 0% = 0em
    1: 0, // 0%
    2: -0.007, // -0.7%
    3: -0.013, // -1.3%
  },
  lineHeight: {
    // Figma: 22px, 38px, 160%
    1: 18, // Base
    2: 22, // Figma: 22px
    3: 24, // Medium
    4: 28, // Large
    5: 32, // Extra Large
    6: 38, // Figma: 38px
    7: 48, // 160% equivalent for larger fonts
  },
  face: {
    400: { normal: "Figtree-Regular" },
    500: { normal: "Figtree-Medium" },
    600: { normal: "Figtree-SemiBold" },
    700: { normal: "Figtree-Bold" },
    800: { normal: "Figtree-ExtraBold" },
  },
});

export const fonts = {
  figtree: figtreeFont,
};
