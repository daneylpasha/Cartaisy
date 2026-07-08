# Cross-Repo Backend API and Tenant Smoke Test

Run date: 2026-07-03 (GitHub issue #62).

This report records a cross-repo smoke test of the mobile API surface (generated Orval client plus the hand-written axios endpoints the app uses at runtime) against the Cartaisy backend, including tenant/wrong-store behavior. The repeatable test harness is `scripts/smoke/backend-api.smoke.test.ts`.

## Backend Spec Source and Version

- Backend source: `cartaisy-backend` repo, commit `60caa017` ("Merge pull request #80", 2026-07-03), spec `public/swagger.json` version 1.0.0, 73 paths.
- Backend spec freshness: verified — regenerating with `npx tsoa spec` in a clean worktree of commit `60caa017` produces a spec identical to the committed one.
- Mobile snapshot (`api-spec/swagger.json`): an exact subset of the backend spec. The only difference is additive — the backend added `POST /checkout/handoff` (plus `CheckoutHandoff*` schemas) after the mobile snapshot was refreshed on 2026-07-02.
- Mobile generated client: `npm run generate:api` against the committed snapshot produces zero diff — the generated client is in sync with the snapshot.

## Deployed Sandbox Availability

No deployed backend is reachable. Both URLs configured in the local mobile environment return a Railway platform-level 404 ("Application not found"), meaning the apps no longer exist at those URLs:

- `https://cartaisy-backend-production.up.railway.app` — dead
- `https://zapgear-backend-production.up.railway.app` — dead

Verification against a deployed sandbox/staging API is therefore **blocked**. To keep the issue's runtime verification meaningful, the smoke test ran against an ephemeral local sandbox built from backend source instead (below). Runtime findings apply to backend HEAD run via its own standard start command; a future deployment could differ only if it uses a different build/run path than the repo's Dockerfile.

## Sandbox Recipe (fully fabricated data)

- Backend served from a clean git worktree of `cartaisy-backend` at `60caa017`, started with the repo's own command (`npm start`, which is also the production Dockerfile `CMD`: `node --require @swc-node/register -r tsconfig-paths/register src/server.ts`).
- Database: `mongodb-memory-server` (a backend devDependency) — in-memory, discarded after the run.
- Environment: `NODE_ENV=development`, fabricated 64-char `JWT_SECRET`, `REDIS_ENABLED=false`. No Shopify credentials, no Stripe secrets, no real merchant data anywhere.
- Seed (via the backend's own mongoose models): Store A `507f1f77bcf86cd799439011` (matches `docs/examples/sample-merchant.env`), Store B `507f1f77bcf86cd799439022`, inactive Store C `507f1f77bcf86cd799439033`; two active products in store A, one in store B; one fabricated customer registered through the API at test time.
- Mobile side: the smoke suite runs under Jest with `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4123/api/v1` and `EXPO_PUBLIC_STORE_ID=<store A>`, driving the real `apiClient.ts` axios instance (X-Store-ID header, interceptors) and generated client functions.

Re-run: start a sandbox as above, seed it, then
`EXPO_PUBLIC_API_BASE_URL=... EXPO_PUBLIC_STORE_ID=... npx jest --testMatch '**/scripts/smoke/*.smoke.test.ts'`.

## Pass/Fail Matrix

"Mismatch" means observed behavior diverges from the spec/mobile contract. The committed smoke suite asserts the observed behavior below, so a future failing row means backend behavior changed relative to this report.

| Endpoint / flow | Test data | Expected | Actual | Contract mismatch | Follow-up needed |
| --- | --- | --- | --- | --- | --- |
| Spec sync: mobile snapshot vs backend source | commit `60caa017` | identical | identical except backend-only `POST /checkout/handoff` (additive) | Minor | Refresh snapshot + `npm run generate:api` when adopting handoff |
| GET /store/config (store A) | seeded store A | 200 currency/timezone/name | 200 `{currency USD, timezone UTC, name "Smoke Store A"}` | No | No |
| GET /store/config (nonexistent store) | valid-format unknown ID | 404 | 404 `{"error":"Store not found"}` | No | No |
| GET /store/config (malformed store ID) | `not-a-valid-object-id` | 400 | 400 `{"message":"Invalid Store ID format"}` | No | No |
| GET /store/config (inactive store) | store C, `isActive=false` | 403 | 403 `{"error":"Store is not active"}` | No | No |
| GET /customer/homescreen | store A, empty content | 200 success envelope | 200, all section keys present (express route) | No | No |
| GET /customer/search (generated client) | `q=aurora`, store A | 200 results per spec | **404 "Route not found"** — tsoa routes never register at HEAD | **Yes** | Backend (critical) |
| GET /products/{id} (generated client) | seeded-style ID, store A | 200 product per spec | **404 "Route not found"** — tsoa dead; express `/:id` route is commented out | **Yes** | Backend (critical) |
| GET /products (express listing) | store A, 2 seeded products | 200 store-scoped list | **500 "Failed to fetch products"** (`populate('category')` fails); endpoint also absent from spec/client | **Yes** | Backend |
| POST /cart/create (generated client) | empty items, store A | cart response per spec | **404 "Route not found"** | **Yes** | Backend (critical) |
| POST /checkout/init (generated client) | fabricated cart ID | checkout session per spec | **404 "Route not found"** | **Yes** | Backend (critical) |
| GET /unified-cart (hand-written endpoint) | guest, store A | 200 guest cart | 200, empty cart, guest session issued | No (but absent from spec) | Spec coverage |
| POST /customer/auth/register | fabricated email, store A | 201 + JWT | success, token issued, user scoped to store A | No | No |
| POST /customer/auth/login | same customer, store A | 200 + JWT | success, token issued | No | No |
| POST /customer/auth/login (cross-store) | store A customer, store B header | 401 | 401 "Invalid email or password" | No | No |
| GET /customer/auth/profile | Bearer token, store A | 200 own profile | 200, correct email | No | No |
| GET /customer/auth/profile (cross-store header) | store A token, store B header | 403 per `strictStoreValidation` intent | **200 own profile** (mismatch not enforced on this route; no cross-store data returned) | **Yes** (hardening) | Backend |
| GET /customer/orders | fresh customer, Bearer, store A | 200 empty list | 200, 0 orders | No (but absent from spec) | Spec coverage |

## Key Findings

1. **tsoa route registration fails at backend HEAD, killing most of the generated mobile API surface.** At startup, `RegisterRoutes` throws `Class extends value undefined is not a constructor or null` (from `src/generated/routes.ts`; individual tsoa controllers also fail to load standalone). `src/app.ts` catches and logs the error and the server keeps running — so every tsoa-only route returns 404: `/customer/search*`, `/products/{id}`, `/cart/*`, `/checkout/*` (including the new `/checkout/handoff`), `/favorites`, payment methods, and tsoa recommendations. The production `Dockerfile` `CMD` is the same swc-node command as `npm start`, so this is not a sandbox artifact — any deployment of HEAD via the standard path is affected. The mobile app's search screen (`app/search.tsx`) and checkout screen (`app/checkout.tsx`) call these dead endpoints.
2. **The tsoa spec both under- and over-describes the real API.** Endpoints the mobile app actually uses successfully (`/store/config`, `/unified-cart`, `/customer/orders`, express `/customer/homescreen`) are express-served and absent from the spec (mobile covers them with hand-written wrappers, outside generated type safety). Meanwhile the spec describes tsoa endpoints that the backend at HEAD does not actually serve (finding 1). Spec-level sync — which is what the mobile repo's client-generation process verifies — currently cannot prove runtime compatibility.
3. **Express product listing is broken at HEAD.** `GET /products` 500s on `populate('category')` with seeded data. Product listing/detail is therefore fully unavailable from Mongo-backed routes at HEAD.
4. **Tenant fundamentals hold.** Store resolution enforces 404 (missing), 400 (malformed), 403 (inactive); customer accounts do not leak across stores (cross-store login 401); orders are store-scoped; guest unified cart works. One hardening gap: a store A customer token presented with a store B header is accepted on `/customer/auth/profile` (returns only the token's own profile, so no data leakage was observed, but the documented store-mismatch rejection is not applied on this route).
5. **Mobile snapshot is one additive endpoint behind** (`POST /checkout/handoff`), and the generated client has zero drift from the snapshot.

## Recommended Follow-Up Issues

- Backend (critical): fix tsoa route registration at startup (`Class extends value undefined` under `@swc-node/register`); make the failure fatal or health-visible instead of a swallowed try/catch, and add a runtime check that spec-declared routes actually mount.
- Backend: fix `GET /products` 500 (`populate('category')`).
- Backend: enforce store-mismatch rejection on `/customer/auth/profile` (and audit other authenticated express routes for the same gap).
- Backend/mobile: bring `/store/config`, `/unified-cart`, and `/customer/orders` into the tsoa spec so the mobile client can be generated for them, or explicitly document them as out-of-spec surfaces.
- Mobile: refresh `api-spec/swagger.json` and regenerate the client to pick up `POST /checkout/handoff` once the backend actually serves it (completed in mobile issue #72; runtime validation still needs a reachable sandbox with store-scoped Shopify Storefront credentials).
- Cross-repo: once a deployed staging sandbox exists, re-run this suite against it (the harness only needs the two env vars).

## Mobile Snapshot Update (2026-07-08, GitHub issue #72)

The mobile spec snapshot now includes `POST /checkout/handoff`, and the generated checkout client exposes `checkoutHandoff` / `useCheckoutHandoff`. The 2026-07-03 matrix above remains the historical smoke result for backend commit `60caa017`; it should be rerun before release against a reachable sandbox that can create Storefront carts and return Shopify-hosted checkout URLs.

## Related Docs

- `scripts/smoke/backend-api.smoke.test.ts` (the harness)
- `docs/STATUS.md`, `docs/DECISIONS.md`, `docs/TESTING.md`
- `docs/examples/sample-merchant.env` (store A ID reused for the seed)
- GitHub issue #62
