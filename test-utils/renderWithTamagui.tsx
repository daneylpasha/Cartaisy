import { render } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

import config from "@/tamagui.config";

const TamaguiWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

// Components under test use Tamagui primitives, which require the app's
// TamaguiProvider config to resolve tokens and themes. Passing it as the
// RNTL wrapper keeps the provider in place across rerender() calls.
export const renderWithTamagui = (ui: React.ReactElement) =>
  render(ui, { wrapper: TamaguiWrapper });
