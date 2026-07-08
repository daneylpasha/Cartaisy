jest.mock("../../apiClient", () => ({
  axiosInstance: {},
}));

import type { UnifiedCartResponse } from "../unifiedCart";
import {
  getUnifiedCartFromResponse,
  isUnifiedCartResponse,
} from "../unifiedCart";

describe("unifiedCart response mapping", () => {
  it("reads the backend cart from the observed status/data.cart/itemCount response shape", () => {
    const response: UnifiedCartResponse = {
      status: "success",
      data: {
        cart: {
          items: [
            {
              productId: "507f1f77bcf86cd799439a01",
              merchandiseId: "aurora-tee-v1",
              title: "Aurora Tee",
              price: 19.99,
              quantity: 3,
            },
          ],
          itemCount: 3,
          currency: "USD",
        },
      },
    };

    const cart = getUnifiedCartFromResponse(response);

    expect(cart.itemCount).toBe(3);
    expect(cart.items[0]).toEqual(
      expect.objectContaining({
        productId: "507f1f77bcf86cd799439a01",
        quantity: 3,
      })
    );
    expect(cart.items[0]).not.toHaveProperty("_id");
  });

  it("rejects partial status-shaped objects without data.cart", () => {
    expect(isUnifiedCartResponse({ status: "error" })).toBe(false);
    expect(isUnifiedCartResponse({ status: "success", data: {} })).toBe(false);
  });
});
