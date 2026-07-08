# Checkout, Payment, and Orders Private-Beta Smoke Suite

Run date: 2026-07-03 (GitHub issue #63).

This is the repeatable smoke checklist for cart, checkout, payment, and orders on mobile, plus the results of its first run. The automated harness is `scripts/smoke/checkout-orders.smoke.test.ts`; scenarios it cannot reach are listed as manual/blocked checklist items with the exact blocker.

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
