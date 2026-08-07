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

  it("hides the sender name in the mocked notification preview when storeName is empty, instead of leaking the bundled 'Cartaisy' name (fail-closed per docs/MOBILE_BRANDED_BUILD_CHECKLIST.md — Codex P1 finding on PR #120)", () => {
    const { queryByText } = renderWithTamagui(<Notification />);
    expect(queryByText("Cartaisy")).toBeNull();
  });

  it("shows the merchant's real storeName instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByText } = renderWithTamagui(<Notification />);
    expect(getByText("Acme Outfitters")).toBeTruthy();
  });

  it("constrains a long merchant name to one line with ellipsis instead of overflowing past the '3s ago' timestamp (Codex review finding on PR #120)", () => {
    // The card is fixed-width/fixed-height and the store-config contract
    // places no length limit on `name` — a long real merchant name could
    // previously push past the adjacent timestamp or outside the card,
    // since the sender row had no width constraint, flexShrink, or
    // numberOfLines (the former hardcoded "Cartaisy" was always short
    // enough that this never showed up).
    const longName = "Acme Outfitters International Trading Company Ltd.";
    useStoreConfigStore.setState({ storeName: longName });

    const { getByText } = renderWithTamagui(<Notification />);
    const nameText = getByText(longName);

    expect(nameText.props.numberOfLines).toBe(1);
    expect(nameText.props.ellipsizeMode).toBe("tail");
  });
});
