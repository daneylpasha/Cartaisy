// Import colors from Tamagui tokens to maintain single source of truth
import { tokens } from "../tamagui/token";

// Re-export colors from tokens
export const colors = tokens.color;

// Type for color keys
export type ColorKey = keyof typeof colors;

// Helper function to get color value
export const getColor = (colorKey: ColorKey): string => {
  return colors[colorKey];
};

export default colors;
