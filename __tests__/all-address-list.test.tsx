import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { BETA_CHECKOUT_ENTRY_ROUTE } from "@/utils/checkoutFlowGate";

let mockSearchParams: Record<string, string> = {};
const mockUseFormattedAddresses = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock("@react-navigation/native", () => {
  const ReactActual = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      ReactActual.useEffect(callback, []);
    },
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/api/hooks/useAddresses", () => ({
  useFormattedAddresses: () => mockUseFormattedAddresses(),
}));

jest.mock("@/components/molecules/AddressCard", () => {
  const { Text } = require("react-native");
  return {
    AddressCard: ({ item }: { item: { address: string } }) => (
      <Text>{item.address}</Text>
    ),
  };
});

import SelectAddressScreen from "@/app/allAddressList";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const { router: mockRouter } = jest.requireMock("expo-router");

const rawAddress = {
  _id: "address-1",
  address1: "123 Beta Street",
};

const formattedAddress = {
  id: 0,
  addressId: "address-1",
  name: "Beta Shopper",
  address: "123 Beta Street",
  shipping: "Shipping Available",
  isDefault: true,
};

describe("all address list legacy checkout gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = { sessionId: "legacy-session" };
    mockUseFormattedAddresses.mockReturnValue({
      addresses: [rawAddress],
      formattedAddresses: [formattedAddress],
      isAuthenticated: true,
      refetch: jest.fn(),
      setDefault: jest.fn(),
      isSettingDefault: false,
    });
  });

  it("replaces legacy checkout address returns with the cart entry", () => {
    const { getByText } = renderWithTamagui(<SelectAddressScreen />);

    fireEvent.press(getByText("Confirm Address"));

    expect(mockRouter.replace).toHaveBeenCalledWith(BETA_CHECKOUT_ENTRY_ROUTE);
    expect(mockRouter.push).not.toHaveBeenCalledWith(BETA_CHECKOUT_ENTRY_ROUTE);
    expect(mockRouter.push).not.toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/checkout" })
    );
  });
});
