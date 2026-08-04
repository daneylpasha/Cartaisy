/**
 * Covers Part A of the secondary-color-and-split-matrix ticket:
 * useDynamicSecondaryTheme extends PR #115's proven mechanism
 * (updateTheme, the same public API that powers light/dark mode) to
 * `secondaryColor`, so `$secondary`-styled surfaces reflect the merchant's
 * secondary brand color even though they never manually read the store.
 *
 * The three components rendered here (AddressCard, PriceWithDiscount,
 * OrderCard) were never wired for branding by any prior ticket — they're
 * picked specifically *because* they're ordinary, untouched `$secondary`
 * consumers, to prove the mechanism actually cascades rather than
 * asserting on the mechanism's own internals. Unlike $primary (which was
 * spot-checked as a fixed-background paired with fixed white text),
 * $secondary is used exclusively as *foreground* — text color / icon tint —
 * so these assertions check resolved text/icon color, not background color.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";
import { act } from "@testing-library/react-native";

import { AddressCard } from "@/components/molecules/AddressCard";
import { PriceWithDiscount } from "@/components/molecules/DiscountBadge";
import OrderCard from "@/components/molecules/orders/OrderCard";
import { useDynamicSecondaryTheme } from "@/hooks/useDynamicSecondaryTheme";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

// tamagui/token.ts SECONDARY_COLOR — keep in sync. rgba format (not hex) is
// intentional: it's the bundled fallback, distinct in shape from the
// hex-only merchant override validateBranding accepts, which is a useful
// signal in these assertions that the *bundled* value (not a coincidental
// hex match) is what's resolving.
const DEFAULT_SECONDARY = "rgba(75, 85, 99, 1)";

// A tiny harness that mounts the hook exactly like AppInitializer does,
// alongside a real, previously-unwired $secondary consumer.
const ThemeSyncHarness = ({ children }: { children: React.ReactNode }) => {
  useDynamicSecondaryTheme();
  return <>{children}</>;
};

const ADDRESS_ITEM = {
  id: 1,
  name: "Home",
  address: "221B Baker Street, London",
  shipping: "Standard shipping",
};

const renderAddressCard = () =>
  renderWithTamagui(
    <ThemeSyncHarness>
      <AddressCard
        item={ADDRESS_ITEM}
        selectedAddress={null}
        setSelectedAddress={jest.fn()}
      />
    </ThemeSyncHarness>
  );

describe("useDynamicSecondaryTheme", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
  });

  it("leaves $secondary at the bundled Cartaisy gray when no merchant secondaryColor is set (fallback discipline)", () => {
    const { getByText } = renderAddressCard();
    const addressText = getByText(ADDRESS_ITEM.address);
    expect(addressText.props.style.color).toBe(DEFAULT_SECONDARY);
  });

  it("cascades a merchant secondaryColor to a previously-unwired $secondary consumer (AddressCard's address line) with no per-component change", () => {
    useStoreConfigStore.setState({ secondaryColor: "#336699" });

    const { getByText } = renderAddressCard();
    const addressText = getByText(ADDRESS_ITEM.address);
    expect(addressText.props.style.color).toBe("#336699");
  });

  it("cascades to a second, unrelated previously-unwired consumer (PriceWithDiscount's strikethrough $secondary price)", () => {
    useStoreConfigStore.setState({ secondaryColor: "#118844" });

    const { getByText } = renderWithTamagui(
      <ThemeSyncHarness>
        <PriceWithDiscount price={40} compareAtPrice={80} currency="USD" />
      </ThemeSyncHarness>
    );

    const strikethroughPrice = getByText("$80.00");
    expect(strikethroughPrice.props.style.color).toBe("#118844");
  });

  it("cascades to a third, unrelated previously-unwired consumer (OrderCard's date/status $secondary text)", () => {
    useStoreConfigStore.setState({ secondaryColor: "#663399" });

    const { getByText } = renderWithTamagui(
      <ThemeSyncHarness>
        <OrderCard item={{ id: 1, date: "2026-01-01" }} />
      </ThemeSyncHarness>
    );

    // No `status` provided -> OrderCard's own fallback is "In Progress",
    // which renders the date in $secondary.
    const dateText = getByText("2026-01-01");
    expect(dateText.props.style.color).toBe("#663399");
  });

  it("reverts to the bundled Cartaisy gray when secondaryColor is cleared (e.g. a later fetch has nothing configured)", () => {
    useStoreConfigStore.setState({ secondaryColor: "#654321" });
    const { getByText, rerender } = renderAddressCard();
    expect(getByText(ADDRESS_ITEM.address).props.style.color).toBe(
      "#654321"
    );

    act(() => {
      useStoreConfigStore.setState({ secondaryColor: undefined });
    });
    rerender(
      <ThemeSyncHarness>
        <AddressCard
          item={ADDRESS_ITEM}
          selectedAddress={null}
          setSelectedAddress={jest.fn()}
        />
      </ThemeSyncHarness>
    );

    expect(getByText(ADDRESS_ITEM.address).props.style.color).toBe(
      DEFAULT_SECONDARY
    );
  });
});
