/**
 * Reactivity coverage for TICKETwiremerchantstorenameintocompanynamestrings.md.
 *
 * The notification-permission screen's mocked notification preview showed
 * the hardcoded `t("common.companyName")` ("Cartaisy") as the sender name
 * instead of the merchant's real `storeName`. Scoped narrowly to that one
 * text node — the screen's permission-request flow (expo-notifications,
 * AuthGuardContext, authApi) is mocked out rather than exercised, since it's
 * unrelated to this ticket.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
}));

jest.mock("expo-router", () => ({
  router: { dismiss: jest.fn(), replace: jest.fn(), push: jest.fn() },
}));

jest.mock("@/contexts/AuthGuardContext", () => ({
  useAuthGuard: () => ({
    pendingReturnPath: null,
    clearPendingReturnPath: jest.fn(),
  }),
}));

jest.mock("@/api/endpoints/auth", () => ({
  __esModule: true,
  default: { completeProfile: jest.fn() },
}));

import React from "react";

import Notification from "@/app/notification";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("notification screen companyName", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "" });
  });

  it("falls back to the bundled 'Cartaisy' name in the mocked notification preview when storeName is empty", () => {
    const { getByText } = renderWithTamagui(<Notification />);
    expect(getByText("Cartaisy")).toBeTruthy();
  });

  it("shows the merchant's real storeName instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByText } = renderWithTamagui(<Notification />);
    expect(getByText("Acme Outfitters")).toBeTruthy();
  });
});
