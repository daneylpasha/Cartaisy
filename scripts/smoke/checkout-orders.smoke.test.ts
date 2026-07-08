/**
 * Checkout, payment, and orders private-beta smoke suite (GitHub issue #63).
 *
 * Drives the mobile app's real cart/checkout/orders API surface — the
 * generated Orval client used by useCartManager and app/checkout.tsx,
 * plus the hand-written unified-cart and orders endpoints — against a
 * seeded local backend sandbox. Results and the full scenario checklist
 * (including the UI/manual and payment scenarios this suite cannot
 * reach) live in docs/CHECKOUT_ORDERS_SMOKE_TEST.md.
 *
 * Each row asserts the OBSERVED behavior of backend HEAD at the time of
 * the run; known contract mismatches are flagged with `mismatch: true`.
 * A failing row means backend behavior changed since the last
 * documented run — update the doc, not just the test.
 *
 * NOT part of the CI suite: jest.config.js only matches
 * `**\/__tests__\/**\/*.test.ts`. Run explicitly against a sandbox
 * seeded with the issue #63 fixtures (stores A/B/inactive C, Aurora Tee
 * product 507f1f77bcf86cd799439a01, customers smoke-a/smoke-b, orders
 * SMOKE-1001/SMOKE-1002) — never against a real merchant backend:
 *
 *   EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4123/api/v1 \
 *   EXPO_PUBLIC_STORE_ID=507f1f77bcf86cd799439011 \
 *   npx jest --testMatch '**\/scripts\/smoke\/checkout-orders.smoke.test.ts'
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.setTimeout(30000);

import { axiosInstance } from "@/api/apiClient";
import unifiedCartApi, {
  isUnifiedCartResponse,
} from "@/api/endpoints/unifiedCart";
import type { UnifiedCartResponse } from "@/api/endpoints/unifiedCart";
import { createCart } from "@/api/generated/cart/cart";
import {
  completeCheckout,
  getShippingRates,
  initializeCheckout,
} from "@/api/generated/checkout/checkout";
import { customerLogin } from "@/api/generated/customer-authentication/customer-authentication";

const STORE_A = "507f1f77bcf86cd799439011";
const STORE_B = "507f1f77bcf86cd799439022";
const STORE_C_INACTIVE = "507f1f77bcf86cd799439033";
const STORE_MISSING = "507f1f77bcf86cd799439099";
const PRODUCT_AURORA = "507f1f77bcf86cd799439a01";
const ORDER_A = "507f1f77bcf86cd799439d01"; // owned by smoke-a
const ORDER_B = "507f1f77bcf86cd799439d02"; // owned by smoke-b

interface MatrixRow {
  flow: string;
  endpoint: string;
  testData: string;
  expected: string;
  actual: string;
  /** true when observed behavior diverges from the spec/mobile contract */
  mismatch: boolean;
  pass: boolean;
}

const matrix: MatrixRow[] = [];

const record = (row: MatrixRow) => {
  matrix.push(row);
  if (!row.pass) {
    throw new Error(`${row.flow} — expected [${row.expected}] got [${row.actual}]`);
  }
};

const status = (err: any): number | undefined => err?.response?.status;
// Distinguish an API error (has a response) from a transport failure.
const errText = (e: any) =>
  e?.response
    ? `${status(e)} ${JSON.stringify(e.response.data)?.slice(0, 160)}`
    : `no response (${e?.code ?? e?.message ?? "unknown transport error"})`;
const storeHeader = (storeId: string) => ({ headers: { "X-Store-ID": storeId } });
type UnifiedCartSmokeResult = UnifiedCartResponse | { error: string };
const smokeCart = (result: UnifiedCartSmokeResult) =>
  isUnifiedCartResponse(result) ? result.data.cart : undefined;
const smokeStatus = (result: UnifiedCartSmokeResult) =>
  isUnifiedCartResponse(result)
    ? result.status
    : "error" in result
      ? result.error
      : "invalid unified-cart response";

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log("SMOKE_MATRIX_JSON " + JSON.stringify(matrix, null, 2));
});

describe("checkout/payment/orders smoke (issue #63)", () => {
  // ---------------------------------------------------------------------
  // The app's PRIMARY cart/checkout pipeline (useCartManager +
  // app/checkout.tsx) runs on the generated /cart and /checkout clients.
  // ---------------------------------------------------------------------

  it("KNOWN MISMATCH: app's primary add-to-cart path targets an unregistered route", async () => {
    const actual = await createCart({ items: [] })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "add to cart (app primary path, generated client)",
      endpoint: "POST /cart/create",
      testData: `guest, X-Store-ID=${STORE_A}`,
      expected:
        "cart response per spec; backend HEAD returns 404 (tsoa routes never register) — the whole useCartManager pipeline is blocked",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("KNOWN MISMATCH: checkout init targets an unregistered route", async () => {
    const actual = await initializeCheckout({ cartId: "gid://shopify/Cart/fabricated" })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "checkout init (app path, generated client)",
      endpoint: "POST /checkout/init",
      testData: "fabricated Shopify cart ID",
      expected: "checkout session per spec; backend HEAD returns 404",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("KNOWN MISMATCH: shipping step targets an unregistered route", async () => {
    const actual = await getShippingRates({ sessionId: "fabricated-session", addressId: 0 })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "shipping step (app path, generated client)",
      endpoint: "GET /checkout/shipping-rates",
      testData: "fabricated checkout session ID",
      expected: "shipping rates per spec; backend HEAD returns 404",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("KNOWN MISMATCH: payment/complete step targets an unregistered route", async () => {
    const actual = await completeCheckout({ sessionId: "fabricated-session" })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "payment step / order completion (app path, generated client)",
      endpoint: "POST /checkout/complete",
      testData: "fabricated checkout session ID",
      expected:
        "payment/complete per spec; backend HEAD returns 404 — payment success/failure paths and the order success screen are unreachable",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  // ---------------------------------------------------------------------
  // Unified cart — the working Mongo-backed cart the app currently uses
  // only for guest checkout info. Exercised as the functioning cart
  // surface; response-shape divergence from the mobile types is flagged.
  //
  // The rows in this block (and the session-dependent store-unavailable
  // rows below) build on the add-to-cart row: it creates the item AND
  // makes the apiClient response interceptor capture the guest
  // X-Session-ID that all later requests carry. requireCartSession()
  // short-circuits dependent rows with the root cause when it failed
  // (e.g. seed missing the Aurora Tee fixture).
  // ---------------------------------------------------------------------

  let cartSessionReady = false;

  const requireCartSession = () => {
    if (!cartSessionReady) {
      throw new Error(
        "no guest cart session — the 'add to cart (unified cart)' row must pass first; " +
          "check the sandbox seed (Aurora Tee fixture 507f1f77bcf86cd799439a01)"
      );
    }
  };

  it("unified cart: add to cart works for a guest", async () => {
    const res: UnifiedCartSmokeResult = await unifiedCartApi
      .addToCart({
        productId: PRODUCT_AURORA,
        merchandiseId: "aurora-tee-v1",
        quantity: 1,
        title: "Aurora Tee",
        price: 19.99,
      })
      .then((r) => r.data)
      .catch((e) => ({ error: errText(e) }));
    const cart = smokeCart(res);
    record({
      flow: "add to cart (unified cart)",
      endpoint: "POST /unified-cart",
      testData: `guest, seeded Aurora Tee ${PRODUCT_AURORA}`,
      expected:
        "item added, guest session issued. Backend returns {status, data:{cart:{items,itemCount}}} with no per-item _id",
      actual: `status=${smokeStatus(res)} items=${cart?.items?.length} itemCount=${cart?.itemCount} keys=${isUnifiedCartResponse(res) ? Object.keys(res.data).join(",") : "error"}`,
      mismatch: false,
      pass: isUnifiedCartResponse(res) && res.status === "success" && cart?.items?.length === 1,
    });
    cartSessionReady = true; // record() throws on fail, so this only runs on pass
  });

  it("unified cart: update quantity works (item keyed by productId)", async () => {
    requireCartSession();
    const res: UnifiedCartSmokeResult = await unifiedCartApi
      .updateCartItem(PRODUCT_AURORA, { quantity: 3 })
      .then((r) => r.data)
      .catch((e) => ({ error: errText(e) }));
    const qty = smokeCart(res)?.items?.[0]?.quantity;
    record({
      flow: "update quantity (unified cart)",
      endpoint: "PATCH /unified-cart/{itemId}",
      testData: "same guest session (auto-captured by apiClient interceptor), quantity 1 -> 3",
      expected:
        "200, quantity 3. Note: the item key is the productId and items carry no _id",
      actual: `status=${smokeStatus(res)} quantity=${qty}`,
      mismatch: false,
      pass: isUnifiedCartResponse(res) && res.status === "success" && qty === 3,
    });
  });

  it("unified cart: cart recovery — session persists across a fresh GET", async () => {
    requireCartSession();
    const res: UnifiedCartSmokeResult = await unifiedCartApi
      .getCart()
      .then((r) => r.data)
      .catch((e) => ({ error: errText(e) }));
    const items = smokeCart(res)?.items;
    record({
      flow: "cart recovery/refresh (unified cart)",
      endpoint: "GET /unified-cart",
      testData: "same guest session; re-fetch after add + update",
      expected: "200, cart still has Aurora Tee at quantity 3",
      actual: `status=${smokeStatus(res)} items=${items?.length} qty=${items?.[0]?.quantity}`,
      mismatch: false,
      pass: isUnifiedCartResponse(res) && res.status === "success" && items?.length === 1 && items?.[0]?.quantity === 3,
    });
  });

  it("unified cart: guest checkout info saves (the app's real unified-cart usage)", async () => {
    requireCartSession();
    const actual = await unifiedCartApi
      .saveGuestCheckoutInfo({
        email: "smoke-guest@sandbox.invalid",
        phone: "+10000000000",
        fullName: "Smoke Guest",
      })
      .then((r) => `${r.status} ${JSON.stringify(r.data)?.slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "guest checkout info (unified cart)",
      endpoint: "POST /unified-cart/guest-checkout-info",
      testData: "fabricated guest contact details, same session",
      expected: "2xx saved",
      actual,
      mismatch: false,
      pass: /^2\d\d/.test(actual),
    });
  });

  it("unified cart: remove item works", async () => {
    requireCartSession();
    const res: UnifiedCartSmokeResult = await unifiedCartApi
      .removeFromCart(PRODUCT_AURORA)
      .then((r) => r.data)
      .catch((e) => ({ error: errText(e) }));
    const items = smokeCart(res)?.items;
    record({
      flow: "remove item (unified cart)",
      endpoint: "DELETE /unified-cart/{itemId}",
      testData: "same guest session, remove Aurora Tee",
      expected: "200, cart empty",
      actual: `status=${smokeStatus(res)} items=${items?.length}`,
      mismatch: false,
      pass: isUnifiedCartResponse(res) && res.status === "success" && items?.length === 0,
    });
  });

  // ---------------------------------------------------------------------
  // Store unavailable states during cart flows.
  // ---------------------------------------------------------------------

  it("KNOWN MISMATCH: unified cart accepts an inactive store", async () => {
    requireCartSession(); // the asserted 500 only occurs with a cross-store session attached
    const actual = await axiosInstance
      .get("/unified-cart", storeHeader(STORE_C_INACTIVE))
      .then((r) => `200 ${JSON.stringify(r.data)?.slice(0, 80)}`)
      .catch(errText);
    record({
      flow: "store unavailable: inactive store during cart flow",
      endpoint: "GET /unified-cart",
      testData: `X-Store-ID=${STORE_C_INACTIVE} (isActive=false), guest session from earlier rows attached by the app client`,
      expected:
        "403 store not active (as /store/config enforces); backend HEAD returns 500 'Authentication failed' when a session from another store is attached, and 200 with no store check when sessionless (verified by raw probe) — neither is a clean store-unavailable signal",
      actual,
      mismatch: true,
      pass: actual.startsWith("500"),
    });
  });

  it("KNOWN MISMATCH: unified cart accepts a nonexistent store", async () => {
    requireCartSession(); // the asserted 500 only occurs with a cross-store session attached
    const actual = await axiosInstance
      .get("/unified-cart", storeHeader(STORE_MISSING))
      .then((r) => `200 ${JSON.stringify(r.data)?.slice(0, 80)}`)
      .catch(errText);
    record({
      flow: "store unavailable: nonexistent store during cart flow",
      endpoint: "GET /unified-cart",
      testData: `X-Store-ID=${STORE_MISSING}, guest session from earlier rows attached by the app client`,
      expected:
        "404 store not found; backend HEAD returns 500 'Authentication failed' when a session from another store is attached, and 200 with no store check when sessionless (verified by raw probe)",
      actual,
      mismatch: true,
      pass: actual.startsWith("500"),
    });
  });

  it("store unavailable: malformed store ID is rejected during cart flow", async () => {
    const actual = await axiosInstance
      .get("/unified-cart", storeHeader("not-a-valid-object-id"))
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)?.slice(0, 80)}`)
      .catch(errText);
    record({
      flow: "store unavailable: malformed store ID during cart flow",
      endpoint: "GET /unified-cart",
      testData: "X-Store-ID=not-a-valid-object-id",
      expected: "400 invalid store ID format",
      actual,
      mismatch: false,
      pass: actual.startsWith("400"),
    });
  });

  // ---------------------------------------------------------------------
  // Orders — hand-written /customer/orders client (useOrders).
  // ---------------------------------------------------------------------

  let token: string | undefined;

  const requireToken = (): string => {
    if (!token) {
      throw new Error("no auth token — the login row must pass before token-dependent rows");
    }
    return token;
  };

  it("login as seeded customer A (fixture account, fabricated credentials)", async () => {
    const res: any = await customerLogin({
      email: "smoke-a@sandbox.invalid",
      password: "smoke-pass-123",
    });
    token = res?.data?.token;
    record({
      flow: "auth: login seeded customer",
      endpoint: "POST /customer/auth/login",
      testData: "smoke-a@sandbox.invalid on store A (seeded fixture)",
      expected: "success envelope with JWT",
      actual: `token=${token ? "issued" : "missing"}`,
      mismatch: false,
      pass: Boolean(token),
    });
  });

  it("orders list returns the seeded order", async () => {
    const actual = await axiosInstance
      .get("/customer/orders", {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_A },
      })
      .then((r) => {
        const orders: any[] = (r.data as any)?.data?.orders ?? [];
        return `200 orders=${orders.length} first=${orders[0]?.orderNumber}`;
      })
      .catch(errText);
    record({
      flow: "orders list",
      endpoint: "GET /customer/orders",
      testData: "customer A, seeded order SMOKE-1001",
      expected: "200 with exactly the customer's own order",
      actual,
      mismatch: false,
      pass: actual === "200 orders=1 first=SMOKE-1001",
    });
  });

  it("order detail resolves the customer's own order", async () => {
    const actual = await axiosInstance
      .get(`/customer/orders/${ORDER_A}`, {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_A },
      })
      .then((r) => {
        const order: any = (r.data as any)?.data?.order ?? (r.data as any)?.data;
        return `200 orderNumber=${order?.orderNumber} total=${order?.totalPrice}`;
      })
      .catch(errText);
    record({
      flow: "order detail (own order)",
      endpoint: "GET /customer/orders/{orderId}",
      testData: `order ${ORDER_A} (SMOKE-1001) owned by customer A`,
      expected: "200 with order number and totals",
      actual,
      mismatch: false,
      pass: actual.startsWith("200 orderNumber=SMOKE-1001"),
    });
  });

  it("order detail enforces ownership — another customer's order is not found", async () => {
    const actual = await axiosInstance
      .get(`/customer/orders/${ORDER_B}`, {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_A },
      })
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)?.slice(0, 80)}`)
      .catch(errText);
    record({
      flow: "order detail (ownership)",
      endpoint: "GET /customer/orders/{orderId}",
      testData: `order ${ORDER_B} (SMOKE-1002) owned by customer B, requested with customer A token`,
      expected: "404 (ownership enforced by customer-scoped query)",
      actual,
      mismatch: false,
      pass: actual.startsWith("404"),
    });
  });

  it("order detail rejects a malformed order ID", async () => {
    const actual = await axiosInstance
      .get("/customer/orders/not-an-id", {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_A },
      })
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)?.slice(0, 80)}`)
      .catch(errText);
    record({
      flow: "order detail (malformed ID)",
      endpoint: "GET /customer/orders/{orderId}",
      testData: "orderId=not-an-id",
      expected: "400 invalid ID",
      actual,
      mismatch: false,
      pass: actual.startsWith("400"),
    });
  });

  it("KNOWN MISMATCH: orders list ignores a mismatched store header", async () => {
    const actual = await axiosInstance
      .get("/customer/orders", {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_B },
      })
      .then((r) => {
        const orders: any[] = (r.data as any)?.data?.orders ?? [];
        return `200 orders=${orders.length} first=${orders[0]?.orderNumber} storeId=${orders[0]?.storeId}`;
      })
      .catch(errText);
    record({
      flow: "store unavailable/tenant: orders with cross-store header",
      endpoint: "GET /customer/orders",
      testData: "customer A token with X-Store-ID=store B",
      expected:
        "403 store mismatch per strictStoreValidation intent; backend HEAD returns 200 with store A's orders (filter is customer-scoped only, header not cross-checked)",
      actual,
      mismatch: true,
      pass: actual.startsWith("200 orders=1 first=SMOKE-1001"),
    });
  });
});
