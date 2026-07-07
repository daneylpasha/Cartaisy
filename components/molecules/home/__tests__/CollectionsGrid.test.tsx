import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

const { router } = jest.requireMock("expo-router");

// Home module renderer resilience: the home screen feeds this component
// straight from the backend homescreen payload, so it must tolerate a
// missing or malformed payload without crashing.

describe("CollectionsGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when the payload is missing", () => {
    const { toJSON } = renderWithTamagui(<CollectionsGrid itemData={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it("renders nothing when the payload is an empty list", () => {
    const { toJSON } = renderWithTamagui(<CollectionsGrid itemData={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders malformed items (missing id/title/image/collection) without crashing", () => {
    const malformed = [
      {} as any,
      { title: "Only Title" } as any,
      { id: "3", imageUrl: null } as any,
    ];

    const { getByText } = renderWithTamagui(<CollectionsGrid itemData={malformed} />);

    expect(getByText("Only Title")).toBeTruthy();
  });

  it("does not navigate for an item without a collectionId, and navigates for one with it", () => {
    const items = [
      { id: "1", title: "No Collection" } as any,
      { id: "2", title: "Shoes", collectionId: "gid://shopify/Collection/42" } as any,
    ];

    const { getByText } = renderWithTamagui(<CollectionsGrid itemData={items} />);

    fireEvent.press(getByText("No Collection"));
    expect(router.push).not.toHaveBeenCalled();

    fireEvent.press(getByText("Shoes"));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/products",
        params: expect.objectContaining({ categoryName: "Shoes" }),
      })
    );
  });
});
