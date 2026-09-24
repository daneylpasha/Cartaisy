import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { ShopperState } from "@/components/molecules/ShopperState";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("ShopperState", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "", isLoaded: false });
  });

  it("renders calm empty copy and a branded action without a Cartaisy wordmark", () => {
    const onAction = jest.fn();
    const { getByText, queryByText } = renderWithTamagui(
      <ShopperState
        title="Your cart is empty"
        message="Browse the catalog and add something you like."
        icon="cartIcon"
        actionLabel="Start shopping"
        onAction={onAction}
      />
    );

    expect(getByText("Your cart is empty")).toBeTruthy();
    expect(getByText("Browse the catalog and add something you like.")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();

    fireEvent.press(getByText("Start shopping"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("omits the action when the screen has nothing to retry", () => {
    const { queryByText } = renderWithTamagui(
      <ShopperState
        title="Nothing here yet"
        message="This collection does not have products right now."
        icon="researchIcon"
        presentation="illustration"
      />
    );

    expect(queryByText("Try again")).toBeNull();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });
});
