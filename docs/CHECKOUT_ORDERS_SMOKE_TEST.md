# Checkout, Payment, and Orders Private-Beta Smoke Suite

Latest run date: 2026-07-09 (GitHub issue #82).

Previous run date: 2026-07-09 (GitHub issue #80).

Historical run date: 2026-07-03 (GitHub issue #63).

This is the repeatable smoke checklist for cart, checkout, payment, and orders on mobile, plus the results of its first run. The automated harness is `scripts/smoke/checkout-orders.smoke.test.ts`; scenarios it cannot reach are listed as manual/blocked checklist items with the exact blocker.

## Tenant-Mismatch Cart/Checkout/Orders Rerun (2026-07-09, GitHub issue #82)

Goal: verify cart, checkout handoff, and orders behavior for correct store, wrong store, inactive/nonexistent/malformed store, guest-session mismatch, and authenticated Store A token with Store B header where practical.

Environment:

- Backend target: `https://cartaisy-backend-production.up.railway.app/api/v1` from the current mobile public config.
- Backend response identity: Railway platform fallback, `server: railway-hikari`, `x-railway-fallback: true`.
- Backend commit: unavailable because no Cartaisy backend application is mounted at the configured Railway URL.
- Store ID: configured public mobile store ID `6926c642b33c580ada05d8d0`; no Shopify credentials, Storefront tokens, Stripe secrets, customer data, production secrets, or real merchant data were used or recorded.
- Local seeded backend: unavailable in this workspace, so Store A/Store B authenticated and guest-session mismatch rows could not be exercised against real seeded state.

Command:

```bash
EXPO_PUBLIC_API_BASE_URL=https://cartaisy-backend-production.up.railway.app/api/v1 EXPO_PUBLIC_STORE_ID=6926c642b33c580ada05d8d0 npx jest --testMatch '**/scripts/smoke/checkout-orders.smoke.test.ts' --runInBand
```

Result: **FAIL / BLOCKED**. The suite reached Railway with network access, but every probed backend route returned platform-level `404 Application not found`. The generated cart and checkout-handoff rows passed only because the historical harness expected a 404 from the older local-backend route-registration bug; in this run the 404 came from Railway before Cartaisy backend code executed. That is not a valid cart, checkout, or tenant-validation pass.

Fresh cart/checkout/orders mismatch matrix:

| Scenario | Surface tested | Expected backend behavior | Actual 2026-07-09 result | Status | Follow-up |
| --- | --- | --- | --- | --- | --- |
| Add to cart, configured store | Generated `POST /cart/create` | Store-scoped cart response or clean 4xx | Railway 404 `Application not found` | **Blocked** | Provide reachable backend with Storefront credentials. |
| Update quantity, configured store | Generated `PUT /cart/{cartId}/items/{lineItemId}` | Store-scoped cart response or clean 4xx | Railway 404 `Application not found` | **Blocked** | Re-test against reachable backend. |
| Remove item, configured store | Generated `DELETE /cart/{cartId}/items/{lineItemId}` | Store-scoped cart response or clean 4xx | Railway 404 `Application not found` | **Blocked** | Re-test against reachable backend. |
| Hosted checkout handoff | Generated `POST /checkout/handoff` | Hosted checkout URL or clean 4xx for fabricated cart ID | Railway 404 `Application not found`; no checkout URL | **Blocked** | Re-test with reachable backend and store-scoped Storefront credentials. |
| Malformed store during cart flow | `GET /unified-cart` with malformed `X-Store-ID` | 400 invalid store ID format | Railway 404 `Application not found` | **Blocked** | Re-test against Cartaisy backend code. |
| Inactive/nonexistent store during cart flow | `/unified-cart` with inactive/nonexistent store IDs | Clean 403/404 store-unavailable signal | Could not exercise seeded inactive/nonexistent state; Railway 404 | **Blocked** | Re-test against seeded backend. |
| Guest session Store A vs Store B | Guest cart session from Store A with Store B header | Clean store/session mismatch rejection | Could not create guest session; Railway 404 | **Blocked** | Re-test against seeded backend. |
| Orders, configured store | `/customer/orders` with authenticated customer token | Store/customer-scoped order list | Could not login; Railway 404 | **Blocked** | Re-test against seeded backend. |
| Orders, Store A token with Store B header | `/customer/orders` with Store A token and Store B header | Clean store-mismatch rejection | Could not login or seed two stores; Railway 404 | **Blocked** | Re-test against seeded backend. |

Conclusion: no new cart, checkout handoff, guest-session, or orders tenant behavior was confirmed in issue #82 because the configured backend is not mounted. The historical local-sandbox findings below still describe the last confirmed backend-code behavior: generated cart/checkout routes were unavailable, `/unified-cart` had store-unavailable mismatch gaps, and `/customer/orders` ignored a mismatched store header. Those remain backend follow-up items until a fresh reachable sandbox proves otherwise.

## Latest Cart-to-Hosted-Checkout Rerun (2026-07-09, GitHub issue #80)

Goal: prove the current private-beta mobile cart-to-hosted-checkout path: generated `/cart/*` Storefront cart APIs plus generated `POST /checkout/handoff`.

Environment:

- Backend target: `https://cartaisy-backend-production.up.railway.app/api/v1` from the current mobile public env.
- Backend response identity: Railway platform fallback, `server: railway-hikari`, `x-railway-fallback: true`.
- Backend commit: unavailable from the deployed endpoint because the Railway application is not mounted/reachable.
- Store ID: configured public mobile store ID `6926c642b33c580ada05d8d0`; no Shopify credentials, Storefront tokens, or private values were exposed in this repo.
- Mobile branch: `codex/issue-80-smoke-checkout-sandbox`.
- Smoke harness update: `scripts/smoke/checkout-orders.smoke.test.ts` now records generated cart update/remove and hosted checkout handoff rows.

Command:

```bash
EXPO_PUBLIC_API_BASE_URL=https://cartaisy-backend-production.up.railway.app/api/v1 EXPO_PUBLIC_STORE_ID=6926c642b33c580ada05d8d0 npx jest --testMatch '**/scripts/smoke/checkout-orders.smoke.test.ts' --runInBand
```

Result: **FAIL / BLOCKED**. The suite reached Railway with network access, but every backend API request returned platform-level `404 Application not found`.

Fresh scenario summary:

| Scenario | Surface tested | Result | Owner | Notes |
| --- | --- | --- | --- | --- |
| Add to cart | Generated `POST /cart/create` | **Blocked** | Backend / environment | Railway fallback 404. No Storefront cart was created. |
| Update quantity | Generated `PUT /cart/{cartId}/items/{lineItemId}` | **Blocked** | Backend / environment | Railway fallback 404. |
| Remove item | Generated `DELETE /cart/{cartId}/items/{lineItemId}` | **Blocked** | Backend / environment | Railway fallback 404. |
| Hosted checkout handoff | Generated `POST /checkout/handoff` | **Blocked** | Backend / environment | Railway fallback 404. No Shopify-hosted checkout URL was returned. |
| Store unavailable / malformed store behavior | `/unified-cart` malformed-store probe | **Blocked** | Backend / environment | Railway fallback 404, not backend 400 validation. |
| Unified cart recovery and guest checkout info | `/unified-cart` hand-written surface | **Blocked** | Backend / environment | First unified-cart add-to-cart row returned Railway fallback 404; dependent rows could not proceed. |
| Orders list/detail | `/customer/orders` hand-written surface | **Blocked** | Backend / environment | Customer login returned Railway fallback 404; auth-dependent order rows could not proceed. |

Conclusion: the fresh issue #80 run did **not** prove `/cart/*` or `/checkout/handoff` against a functioning current sandbox. The blocker is backend/environment availability: provide a reachable backend sandbox or local backend with a valid store record and store-scoped Shopify Storefront credentials, then rerun this suite. No checkout/payment implementation, runtime branding, backend code, production data, or credentials were changed.

## Environment Used

- No deployed backend exists (both configured Railway URLs are platform-dead; see `docs/CROSS_REPO_SMOKE_TEST.md`). The run used the same ephemeral local sandbox recipe as issue #62: `cartaisy-backend` at commit `60caa017` in a disposable worktree, started with the repo's own standard command, `mongodb-memory-server` storage, fabricated `JWT_SECRET`, `REDIS_ENABLED=false`.
- No Shopify credentials and no Stripe keys of any kind were configured (test-mode Stripe keys for the backend are a follow-up; secrets are never committed).
- Mobile side: Jest drives the app's real API surface — the generated Orval client used by `useCartManager` and `app/checkout.tsx`, the hand-written `unifiedCartApi`, and the hand-written orders calls from `useOrders` — through the real `apiClient.ts` axios instance with `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4123/api/v1`.

## Test Accounts / Store (all fabricated, no secrets)

- Store A `507f1f77bcf86cd799439011` (active), Store B `...9022` (active), Store C `...9033` (inactive).
- Product "Aurora Tee" `507f1f77bcf86cd799439a01` (store A).
- Customers `smoke-a@sandbox.invalid` / `smoke-b@sandbox.invalid` (fabricated passwords, hashed by the backend model on seed).
- Orders `SMOKE-1001` (customer A) and `SMOKE-1002` (customer B), seeded via the backend's own Order model.

## Scenario Results

The app has two cart surfaces: the **primary pipeline** (`useCartManager` + `app/checkout.tsx`, generated `/cart/*` and `/checkout/*` clients) and the **unified cart** (`/unified-cart`, hand-written client, currently used by the app only for guest checkout info). They behave very differently.

| # | Scenario | Surface tested | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Add to cart | App primary (`POST /cart/create`) | **BLOCKED** | 404 — tsoa routes never register at backend HEAD (root blocker, issue #62). The entire `useCartManager` pipeline is dead. |
| 1b | Add to cart | Unified cart (`POST /unified-cart`) | **PASS** | Works for guests; guest session issued. Response shape is `{status, data:{cart:{items,itemCount}}}`; items are keyed by `productId` and carry no `_id`. |
| 2 | Update quantity | Unified cart (`PATCH /unified-cart/{itemId}`) | **PASS** | Item key is the `productId`. |
| 3 | Remove item | Unified cart (`DELETE /unified-cart/{itemId}`) | **PASS** | Cart empties correctly. |
| 4 | Cart recovery/refresh | Unified cart (`GET /unified-cart` + session header) | **PASS** | The apiClient interceptor auto-captures `X-Session-ID`; cart state (item + quantity) persists across fresh requests — the app's real recovery mechanism. |
| 5 | Checkout init / handoff | App primary (`POST /checkout/init`); backend-only `POST /checkout/handoff` | **BLOCKED** | Both 404 (tsoa dead). Handoff is additionally absent from the mobile client (spec snapshot gap, issue #62). |
| 6 | Shipping step | App primary (`GET /checkout/shipping-rates`) | **BLOCKED** | 404. Guest checkout info (`POST /unified-cart/guest-checkout-info`), the app's real unified-cart usage in checkout, **PASSES**. |
| 7 | Payment step | App primary (`POST /checkout/complete`) | **BLOCKED** | 404 — and the sandbox has no Stripe test keys (backend env follow-up). |
| 8 | Payment success path | — | **BLOCKED** | Unreachable: no checkout session can be created. |
| 9 | Payment failure/cancel path | — | **BLOCKED** | Unreachable, same cause. |
| 10 | Order success screen | UI (manual) | **BLOCKED** | Unreachable without a completed checkout. Manual checklist item below for when unblocked. |
| 11 | Orders list | `GET /customer/orders` | **PASS** | Returns exactly the customer's own seeded order (SMOKE-1001). |
| 12 | Order detail | `GET /customer/orders/{orderId}` | **PASS** | Own order resolves with totals; another customer's order → 404 (ownership enforced by customer-scoped query); malformed ID → 400. |
| 13 | Store unavailable during cart/checkout/orders | Unified cart + orders with inactive/nonexistent/malformed store | **FAIL (mismatches)** | Cart routes perform no store existence/active check: sessionless requests get 200; requests carrying a session bound to another store get **500 "Authentication failed"** (unclean). Orders list ignores a mismatched store header (customer A token + store B header still returns store A's orders). Only malformed IDs are cleanly rejected (400). `/store/config` remains the only surface enforcing 404/400/403 correctly. |

Automated harness result: 18/18 rows pass asserting the observed behavior above (7 rows flagged as contract mismatches).

## Mobile Decision Update (2026-07-08, GitHub issue #72)

Mobile private beta now uses the generated `/cart/*` Storefront cart client as the primary cart surface and generated `POST /checkout/handoff` as the cart-to-checkout transition. The handoff route returns a Shopify-hosted checkout URL, so cart and Buy Now actions open that URL instead of entering the legacy native `/checkout/init` flow.

This supersedes the "decision needed" mobile follow-up below. `/unified-cart` remains a real backend surface with the response shape recorded in this smoke run, but it is not the private-beta cart-to-checkout surface because it does not expose the Shopify Storefront cart ID required by `/checkout/handoff`.

Re-run this smoke process against a reachable sandbox with store-scoped Shopify Storefront credentials before release. The 2026-07-03 automated results above remain historical results for the backend commit and environment listed in this document; no new sandbox run is recorded here.

## Blockers

1. **Root blocker (backend, critical):** tsoa route registration fails at backend startup and is swallowed, so the app's entire primary cart → checkout → payment → order pipeline 404s at the first call. Found and documented in issue #62 (`docs/CROSS_REPO_SMOKE_TEST.md`); until fixed, payment and order-success scenarios cannot be smoke tested by any means.
2. **No sandbox payment:** the backend has no Stripe test-mode configuration in the sandbox (and provisioning one is backend/env work — no secrets in this repo). Payment success/failure paths stay blocked even after the tsoa fix until test keys exist.
3. **No deployed staging backend:** all runtime findings are against backend HEAD run locally; there is no deployed environment to compare.
4. **UI-level (simulator) smoke deferred:** the checkout screen's first API call 404s, so a device/simulator run would only re-demonstrate the API blocker. The manual UI checklist below is ready for when the backend is fixed.

## Repeatable Smoke Process

1. Stand up the sandbox (recipe above and in `docs/CROSS_REPO_SMOKE_TEST.md`) and seed the issue #63 fixtures (stores, product `...9a01`, customers smoke-a/smoke-b, orders SMOKE-1001/1002).
2. Run the automated suite:
   `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4123/api/v1 EXPO_PUBLIC_STORE_ID=507f1f77bcf86cd799439011 npx jest --testMatch '**/scripts/smoke/checkout-orders.smoke.test.ts'`
3. Compare failing rows against this document — a failing row means backend behavior changed; update both.
4. Manual UI checklist (run on a dev build against the sandbox once the backend blockers clear):
   - [ ] Add to cart from PDP; badge/count updates.
   - [ ] Update quantity and remove item from the cart tab.
   - [ ] Kill and relaunch the app; cart state recovers.
   - [ ] Enter checkout; shipping step accepts a test address and shows rates.
   - [ ] Payment step renders Stripe test payment sheet; test card succeeds → order success screen shows order number.
   - [ ] Payment failure (declined test card) and cancel both return to a recoverable checkout state.
   - [ ] New order appears in orders list; detail matches; store-unavailable state renders the controlled unavailable UI (`utils/catalogUnavailableError.ts`) instead of a spinner or crash.

## Follow-Up Issues Recommended

- Backend (critical, already recommended in issue #62): fix tsoa route registration; this unblocks scenarios 1, 5–10.
- Backend: add store existence/active validation to `/unified-cart` routes (200 for nonexistent/inactive stores today), and return a clean 4xx instead of 500 "Authentication failed" when a session bound to another store is presented.
- Backend: enforce the store-mismatch check on `/customer/orders` (cross-store header currently ignored), same class as the `/customer/auth/profile` finding in issue #62.
- Mobile: align `api/endpoints/unifiedCart.ts` types with the real backend response shape (`status`/`data.cart`/`itemCount`, items keyed by `productId` with no `_id`) — completed in mobile issue #74.
- Mobile: decision made in issue #72 — private beta uses generated `/cart/*` plus `/checkout/handoff`. Re-run this suite against a reachable sandbox with store-scoped Shopify Storefront credentials to record the first passing hosted-checkout handoff result.
- Backend/env: provision Stripe test-mode keys for the sandbox so payment success/failure paths become smokeable; then run the manual UI checklist end-to-end.

## Related Docs

- `scripts/smoke/checkout-orders.smoke.test.ts` (the harness)
- `docs/CROSS_REPO_SMOKE_TEST.md` (issue #62 — sandbox recipe, root backend blocker)
- `docs/TESTING.md`, `docs/RELEASE_CHECKLIST.md`
- GitHub issue #63
