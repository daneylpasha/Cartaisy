/**
 * Cross-repo backend API and tenant smoke test (GitHub issue #62).
 *
 * Drives the real mobile API surface (generated Orval client plus the
 * hand-written axios endpoints the app uses at runtime) against a live
 * Cartaisy backend sandbox and records a pass/fail matrix. Findings and
 * the sandbox recipe live in docs/CROSS_REPO_SMOKE_TEST.md.
 *
 * Each row asserts the OBSERVED behavior of backend HEAD at the time of
 * the run, including known contract mismatches (flagged with
 * `mismatch: true`). A failing row therefore means backend behavior has
 * CHANGED since the last documented run — update the doc, not just the
 * test.
 *
 * NOT part of the CI suite: jest.config.js only matches
 * `**\/__tests__\/**\/*.test.ts`. Run explicitly against a seeded
 * sandbox (never a real merchant backend):
 *
 *   EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4123/api/v1 \
 *   EXPO_PUBLIC_STORE_ID=507f1f77bcf86cd799439011 \
 *   npx jest --testMatch '**\/scripts\/smoke\/*.smoke.test.ts'
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.setTimeout(30000);

import { axiosInstance } from "@/api/apiClient";
import { getStoreConfig } from "@/api/endpoints/storeConfig";
import unifiedCartApi from "@/api/endpoints/unifiedCart";
import { createCart } from "@/api/generated/cart/cart";
import { initializeCheckout } from "@/api/generated/checkout/checkout";
import {
  customerLogin,
  customerRegister,
} from "@/api/generated/customer-authentication/customer-authentication";
import { getHomescreenData } from "@/api/generated/customer-homescreen/customer-homescreen";
import { getProductDetail } from "@/api/generated/products/products";
import { search } from "@/api/generated/search/search";

const STORE_A = "507f1f77bcf86cd799439011";
const STORE_B = "507f1f77bcf86cd799439022";
const STORE_C_INACTIVE = "507f1f77bcf86cd799439033";
const STORE_MISSING = "507f1f77bcf86cd799439099";

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
// Distinguish an API error (has a response) from a transport failure
// (timeout, refused connection), so the matrix never logs "undefined undefined".
const errText = (e: any) =>
  e?.response
    ? `${status(e)} ${JSON.stringify(e.response.data)?.slice(0, 160)}`
    : `no response (${e?.code ?? e?.message ?? "unknown transport error"})`;
// Per-request headers win over the instance defaults: the apiClient request
// interceptor only fills X-Store-ID when the request has none. The wrong-store
// rows below double as a live check of that precedence — they could not
// return 404/400/403/401 if the default store A header had been sent instead.
const storeHeader = (storeId: string) => ({ headers: { "X-Store-ID": storeId } });

// Fabricated per-run identity so reruns against the same sandbox don't collide.
const runId = Date.now().toString(36);
const testEmail = `smoke-${runId}@sandbox.invalid`;
const testPassword = "smoke-pass-123";

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log("SMOKE_MATRIX_JSON " + JSON.stringify(matrix, null, 2));
});

describe("cross-repo backend smoke (issue #62)", () => {
  it("store config resolves seeded store A settings", async () => {
    const config = await getStoreConfig();
    record({
      flow: "store config (happy path)",
      endpoint: "GET /store/config",
      testData: `X-Store-ID=${STORE_A}`,
      expected: "200 with currency/timezone/name of store A",
      actual: JSON.stringify(config),
      mismatch: false,
      pass:
        config.currency === "USD" && config.timezone === "UTC" && config.name === "Smoke Store A",
    });
  });

  it("store config rejects a valid-format but nonexistent store ID", async () => {
    const actual = await axiosInstance
      .get("/store/config", storeHeader(STORE_MISSING))
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)}`)
      .catch(errText);
    record({
      flow: "wrong store: nonexistent ID",
      endpoint: "GET /store/config",
      testData: `X-Store-ID=${STORE_MISSING}`,
      expected: "404 store not found",
      actual,
      mismatch: false,
      pass: actual.startsWith("404"),
    });
  });

  it("store config rejects a malformed store ID", async () => {
    const actual = await axiosInstance
      .get("/store/config", storeHeader("not-a-valid-object-id"))
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)}`)
      .catch(errText);
    record({
      flow: "wrong store: malformed ID",
      endpoint: "GET /store/config",
      testData: "X-Store-ID=not-a-valid-object-id",
      expected: "400 invalid store ID format",
      actual,
      mismatch: false,
      pass: actual.startsWith("400"),
    });
  });

  it("store config rejects an inactive store", async () => {
    const actual = await axiosInstance
      .get("/store/config", storeHeader(STORE_C_INACTIVE))
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)}`)
      .catch(errText);
    record({
      flow: "wrong store: inactive store",
      endpoint: "GET /store/config",
      testData: `X-Store-ID=${STORE_C_INACTIVE} (isActive=false)`,
      expected: "403 store is not active",
      actual,
      mismatch: false,
      pass: actual.startsWith("403"),
    });
  });

  it("homescreen returns a successful response for store A (express route)", async () => {
    const actual = await getHomescreenData()
      .then((r: any) => `200 success=${r?.success} keys=${Object.keys(r?.data ?? {}).join(",")}`)
      .catch(errText);
    record({
      flow: "home screen",
      endpoint: "GET /customer/homescreen",
      testData: `X-Store-ID=${STORE_A}, empty homescreen content`,
      expected: "200 success envelope (sections may be empty)",
      actual,
      mismatch: false,
      pass: actual.startsWith("200 success=true"),
    });
  });

  it("KNOWN MISMATCH: generated search client targets an unregistered route", async () => {
    const actual = await search({ q: "aurora" })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "product search (generated client)",
      endpoint: "GET /customer/search",
      testData: `q=aurora, X-Store-ID=${STORE_A}`,
      expected:
        "spec/client say 200 search results; backend HEAD returns 404 (tsoa route registration fails at startup)",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("KNOWN MISMATCH: generated product detail client targets an unregistered route", async () => {
    const actual = await getProductDetail("507f1f77bcf86cd799439012")
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "product detail (generated client)",
      endpoint: "GET /products/{productId}",
      testData: `seeded-style product ID, X-Store-ID=${STORE_A}`,
      expected:
        "spec/client say 200 product; backend HEAD returns 404 (tsoa route dead; express /products/:id is commented out)",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("KNOWN MISMATCH: express product listing 500s (and has no generated client)", async () => {
    const actual = await axiosInstance
      .get("/products", storeHeader(STORE_A))
      .then((r) => `unexpected 200: ${JSON.stringify(r.data)?.slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "product listing (express route)",
      endpoint: "GET /products",
      testData: `X-Store-ID=${STORE_A}, 2 seeded active products`,
      expected:
        "200 with store A products; backend HEAD returns 500 (populate('category') fails). Endpoint is also absent from the tsoa spec and generated client",
      actual,
      mismatch: true,
      pass: actual.startsWith("500"),
    });
  });

  it("KNOWN MISMATCH: generated cart client targets an unregistered route", async () => {
    const actual = await createCart({ items: [] })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "cart create (generated client)",
      endpoint: "POST /cart/create",
      testData: `empty items, X-Store-ID=${STORE_A}`,
      expected:
        "spec/client say 200/4xx cart response; backend HEAD returns 404 (tsoa route registration fails at startup)",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("KNOWN MISMATCH: generated checkout client targets an unregistered route", async () => {
    const actual = await initializeCheckout({ cartId: "gid://shopify/Cart/fabricated" })
      .then((r: any) => `unexpected 200: ${JSON.stringify(r).slice(0, 120)}`)
      .catch(errText);
    record({
      flow: "checkout init (generated client)",
      endpoint: "POST /checkout/init",
      testData: "fabricated Shopify cart ID",
      expected:
        "spec/client say checkout session; backend HEAD returns 404 (tsoa route registration fails at startup)",
      actual,
      mismatch: true,
      pass: actual.startsWith("404"),
    });
  });

  it("unified cart (the cart the app actually uses) works for a guest", async () => {
    const actual = await unifiedCartApi
      .getCart()
      .then((r) => {
        const data: any = r.data;
        return `200 success=${data?.success} items=${data?.data?.items?.length ?? data?.cart?.items?.length ?? 0}`;
      })
      .catch(errText);
    record({
      flow: "cart (unified cart, hand-written endpoint)",
      endpoint: "GET /unified-cart",
      testData: `guest (no auth), X-Store-ID=${STORE_A}`,
      expected: "200 empty guest cart (endpoint is express-served, not in tsoa spec)",
      actual,
      mismatch: false,
      pass: actual.startsWith("200"),
    });
  });

  let token: string | undefined;

  // Fail token-dependent rows with an explicit cause instead of a cryptic
  // 401 when the registration/login rows above did not produce a token.
  const requireToken = (): string => {
    if (!token) {
      throw new Error(
        "no auth token — the registration/login rows must pass before token-dependent rows"
      );
    }
    return token;
  };

  it("customer registration succeeds against store A", async () => {
    const res: any = await customerRegister({
      email: testEmail,
      password: testPassword,
      name: "Smoke Tester",
    });
    token = res?.data?.token;
    record({
      flow: "auth: register",
      endpoint: "POST /customer/auth/register",
      testData: `fabricated ${testEmail} on store A`,
      expected: "success envelope with JWT + user scoped to store A",
      actual: `token=${token ? "issued" : "missing"} user=${res?.data?.user?.email}`,
      mismatch: false,
      pass: Boolean(token) && res?.data?.user?.email === testEmail,
    });
  });

  it("customer login succeeds against store A", async () => {
    const res: any = await customerLogin({ email: testEmail, password: testPassword });
    const loginToken = res?.data?.token;
    if (loginToken) {
      token = loginToken;
    }
    record({
      flow: "auth: login",
      endpoint: "POST /customer/auth/login",
      testData: `${testEmail} on store A`,
      expected: "success envelope with JWT",
      actual: `token=${loginToken ? "issued" : "missing"}`,
      mismatch: false,
      pass: Boolean(loginToken),
    });
  });

  it("login for a store A customer fails against store B (tenant isolation)", async () => {
    const actual = await customerLogin(
      { email: testEmail, password: testPassword },
      storeHeader(STORE_B)
    )
      .then((r: any) => `unexpected success: token=${r?.data?.token ? "issued" : "none"}`)
      .catch(errText);
    record({
      flow: "tenant isolation: customer account",
      endpoint: "POST /customer/auth/login",
      testData: `store A customer ${testEmail} with X-Store-ID=${STORE_B}`,
      expected: "401 invalid credentials (customer must not exist across stores)",
      actual,
      mismatch: false,
      pass: actual.startsWith("401"),
    });
  });

  it("authenticated profile resolves for store A customer", async () => {
    const actual = await axiosInstance
      .get("/customer/auth/profile", {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_A },
      })
      .then((r) => `200 email=${(r.data as any)?.data?.user?.email ?? (r.data as any)?.data?.email}`)
      .catch(errText);
    record({
      flow: "auth: customer session/profile",
      endpoint: "GET /customer/auth/profile",
      testData: "Bearer token from registration, store A header",
      expected: "200 with the registered customer's profile",
      actual,
      mismatch: false,
      pass: actual === `200 email=${testEmail}`,
    });
  });

  it("KNOWN MISMATCH: store A token with store B header is NOT rejected", async () => {
    const actual = await axiosInstance
      .get("/customer/auth/profile", {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_B },
      })
      .then((r) => {
        const email = (r.data as any)?.data?.user?.email ?? (r.data as any)?.data?.email;
        return `200 email=${email} (own profile; no cross-store data returned)`;
      })
      .catch(errText);
    record({
      flow: "tenant isolation: token vs store header",
      endpoint: "GET /customer/auth/profile",
      testData: "store A customer token with X-Store-ID=store B",
      expected:
        "403 store ID mismatch per strictStoreValidation intent; backend HEAD returns 200 (mismatch not enforced on this route; response is still only the token's own profile)",
      actual,
      mismatch: true,
      pass: actual.startsWith("200"),
    });
  });

  it("customer orders list is store-scoped and empty for new customer", async () => {
    const actual = await axiosInstance
      .get("/customer/orders", {
        headers: { Authorization: `Bearer ${requireToken()}`, "X-Store-ID": STORE_A },
      })
      .then((r) => {
        const data: any = r.data;
        const count = data?.data?.orders?.length ?? data?.data?.length;
        return `200 orders=${count}`;
      })
      .catch(errText);
    record({
      flow: "orders list",
      endpoint: "GET /customer/orders",
      testData: "fresh customer, Bearer token, store A",
      expected: "200 with empty order list (endpoint is express-served, not in tsoa spec/client)",
      actual,
      mismatch: false,
      pass: actual === "200 orders=0",
    });
  });
});
