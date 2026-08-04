import { tokens } from "./token";

export const themes = {
  light: {
    // background: "#F5F5F5",
    color: "$primary", // Default text color is now primary
    primary: tokens.color.primary, // Use the purple from tokens
    // Registered as a theme key (not just a token) so it's covered by the
    // same runtime override as `primary` — see hooks/useDynamicPrimaryTheme.ts.
    primarylight: tokens.color.primarylight,
    surface: "#FFFFFF",
    border: "#E0E0E0",
  },
  dark: {
    background: "#1C1C1E",
    color: "$primary", // Default text color is now primary
    primary: tokens.color.primary, // Use the purple from tokens
    primarylight: tokens.color.primarylight,
    surface: "#2C2C2E",
    border: "#444444",
  },
};
