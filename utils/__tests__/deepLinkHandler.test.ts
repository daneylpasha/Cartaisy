import {
  BETA_CHECKOUT_ENTRY_ROUTE,
  isLegacyNativeCheckoutEnabled,
} from "@/utils/checkoutFlowGate";
import { handleDeepLink } from "@/utils/deepLinkHandler";

const createRouter = () =>
  ({
    push: jest.fn(),
    replace: jest.fn(),
  } as any);

describe("deep link handler checkout routing", () => {
  it("routes checkout deep links to the cart while legacy native checkout is disabled", () => {
    const router = createRouter();

    expect(isLegacyNativeCheckoutEnabled()).toBe(false);

    handleDeepLink({ type: "checkout" }, router);

    expect(router.push).toHaveBeenCalledWith(BETA_CHECKOUT_ENTRY_ROUTE);
    expect(router.push).not.toHaveBeenCalledWith("/checkout");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("preserves replace navigation for gated checkout deep links", () => {
    const router = createRouter();

    handleDeepLink({ type: "checkout" }, router, { replace: true });

    expect(router.replace).toHaveBeenCalledWith(BETA_CHECKOUT_ENTRY_ROUTE);
    expect(router.replace).not.toHaveBeenCalledWith("/checkout");
    expect(router.push).not.toHaveBeenCalled();
  });
});
