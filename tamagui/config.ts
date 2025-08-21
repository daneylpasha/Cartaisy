import { createTamagui } from "tamagui";
import { fonts } from "./fonts";
import { themes } from "./theme";
import { tokens } from "./token";

export const config = createTamagui({
  defaultTheme: "light",
  themes,
  tokens: {
    color: tokens.color,
    size: tokens.space, // Use space tokens for size
    space: tokens.space,
    radius: tokens.radius,
    zIndex: tokens.zIndex,
  },
  fonts,
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
