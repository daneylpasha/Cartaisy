/**
 * Safety tests for cart state mutations and server-sync recovery in
 * store/useCartStore.ts.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import useCartStore, { CartItem } from "@/store/useCartStore";

const buildItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: "product-1",
  variantId: "variant-1",
  merchandiseId: "variant-1",
  title: "Test Product",
  variantTitle: "Default",
  image: null,
  price: 25,
  currency: "USD",
  quantity: 1,
  quantityAvailable: 10,
  selectedOptions: [{ name: "Size", value: "M" }],
  ...overrides,
});

describe("useCartStore", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    useCartStore.setState({ cartId: null, items: [] });
  });

  describe("addItem", () => {
    it("adds a new item", () => {
      useCartStore.getState().addItem(buildItem());

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].variantId).toBe("variant-1");
    });

    it("accumulates quantity for an existing variant instead of duplicating it", () => {
      useCartStore.getState().addItem(buildItem({ quantity: 2 }));
      useCartStore.getState().addItem(buildItem({ quantity: 3 }));

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5);
    });

    it("merges fresh item data on re-add but preserves the server line item ID", () => {
      useCartStore
        .getState()
        .addItem(buildItem({ lineItemId: "line-1", price: 25 }));
      useCartStore
        .getState()
        .addItem(buildItem({ lineItemId: undefined, price: 30, brandName: "Acme" }));

      const [item] = useCartStore.getState().items;
      expect(item.lineItemId).toBe("line-1");
      expect(item.price).toBe(30);
      expect(item.brandName).toBe("Acme");
    });

    it("keeps distinct variants as separate line items", () => {
      useCartStore.getState().addItem(buildItem({ variantId: "variant-1" }));
      useCartStore.getState().addItem(buildItem({ variantId: "variant-2" }));

      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem and updateQuantity", () => {
    it("removes only the matching variant", () => {
      useCartStore.getState().addItem(buildItem({ variantId: "variant-1" }));
      useCartStore.getState().addItem(buildItem({ variantId: "variant-2" }));

      useCartStore.getState().removeItem("variant-1");

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].variantId).toBe("variant-2");
    });

    it("updates the quantity of the matching variant", () => {
      useCartStore.getState().addItem(buildItem({ quantity: 1 }));

      useCartStore.getState().updateQuantity("variant-1", 4);

      expect(useCartStore.getState().items[0].quantity).toBe(4);
    });

    it.each([0, -1])("removes the item when quantity is set to %d", (quantity) => {
      useCartStore.getState().addItem(buildItem());

      useCartStore.getState().updateQuantity("variant-1", quantity);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("leaves the cart unchanged when updating an unknown variant", () => {
      useCartStore.getState().addItem(buildItem());

      useCartStore.getState().updateQuantity("missing-variant", 3);

      expect(useCartStore.getState().items).toEqual([
        expect.objectContaining({ variantId: "variant-1", quantity: 1 }),
      ]);
    });
  });

  describe("clearCart and syncWithApiResponse", () => {
    it("clearCart resets both the cart ID and the items", () => {
      useCartStore.setState({ cartId: "cart-1" });
      useCartStore.getState().addItem(buildItem());

      useCartStore.getState().clearCart();

      expect(useCartStore.getState().cartId).toBeNull();
      expect(useCartStore.getState().items).toEqual([]);
    });

    it("syncWithApiResponse replaces local state with the server cart (recovery)", () => {
      // Local state has drifted: stale item the server no longer knows about
      useCartStore.setState({
        cartId: "stale-cart",
        items: [buildItem({ variantId: "stale-variant" })],
      });

      const serverItems = [
        buildItem({ variantId: "variant-9", lineItemId: "line-9", quantity: 2 }),
      ];
      useCartStore
        .getState()
        .syncWithApiResponse({ cartId: "server-cart", items: serverItems });

      expect(useCartStore.getState().cartId).toBe("server-cart");
      expect(useCartStore.getState().items).toEqual(serverItems);
    });

    it("syncWithApiResponse can recover to an empty server cart", () => {
      useCartStore.setState({
        cartId: "cart-1",
        items: [buildItem()],
      });

      useCartStore
        .getState()
        .syncWithApiResponse({ cartId: "cart-1", items: [] });

      expect(useCartStore.getState().items).toEqual([]);
      expect(useCartStore.getState().getTotalQuantity()).toBe(0);
    });
  });

  describe("getters", () => {
    it("computes totals across items", () => {
      useCartStore
        .getState()
        .addItem(buildItem({ variantId: "variant-1", price: 10, quantity: 2 }));
      useCartStore
        .getState()
        .addItem(buildItem({ variantId: "variant-2", price: 5.5, quantity: 3 }));

      expect(useCartStore.getState().getTotalQuantity()).toBe(5);
      expect(useCartStore.getState().getTotalPrice()).toBeCloseTo(36.5);
    });

    it("looks up items by variant", () => {
      useCartStore.getState().addItem(buildItem());

      expect(useCartStore.getState().isInCart("variant-1")).toBe(true);
      expect(useCartStore.getState().isInCart("variant-2")).toBe(false);
      expect(useCartStore.getState().getItem("variant-1")?.title).toBe(
        "Test Product"
      );
      expect(useCartStore.getState().getItem("variant-2")).toBeUndefined();
    });
  });
});
