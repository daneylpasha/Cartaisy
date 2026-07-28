# iOS Provisioning Scope

Planning reference for the iOS side of merchant provisioning: what a merchant has to do to get an Apple Developer account, what Cartaisy does once that account exists, and how a branded build actually reaches a physical device before launch.

This is **not** a runbook. `docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md` is the step-by-step process, and this document points at it rather than repeating it. The deliberately missing detail — exact App Store Connect screens, exact `eas` invocations, screenshots — is deferred until a real merchant Apple Developer account exists to write it against, which is the same sequencing the roadmap uses.

This document does not itself trigger any enrollment, account creation, or payment. See "When this becomes actionable" at the end.

## Roadmap position

`docs/cartaisy/ROADMAP.md` (backend repo), Phase 2 — "Prove 'write once, build for many'" — item 3: *"Scope the iOS path (merchant-owned Apple Developer account per `docs/DECISIONS.md`; document enrollment lead time). iOS build proof waits for an available Apple account."*

Phase 2's gate is an installable branded **Android** app on a physical device, produced from env config alone. iOS is sequenced behind it for one concrete reason: Android needs no external account approval to produce an installable artifact, while iOS cannot start until a merchant has been through Apple's enrollment process. That lead time, not engineering effort, is the long pole.

## The decision this rests on

Recorded 2026-07-17 in the `cartaisy-backend` repo's `docs/DECISIONS.md`, "Merchants own their app-store developer accounts":

> Decision: Each merchant enrolls in and owns their own Apple Developer and Google Play developer accounts. Cartaisy performs the setup, provisioning, build, and submission work inside those accounts as part of the paid onboarding/setup service.
>
> Reason: Publishing many merchant apps from one Cartaisy-owned account conflicts with Apple App Store guidelines for white-label/reseller apps and concentrates platform risk; merchant-owned accounts keep app ownership portable and review risk isolated per merchant.
>
> Impact: The onboarding runbook must include merchant account enrollment (including Apple enrollment lead time), credential/access handling per merchant, and EAS credential configuration per merchant account. Sales/onboarding promises must account for Apple enrollment delays.

Everything below follows from that. Note the contrast with Expo/EAS: a separate decision on 2026-07-23 put merchant EAS projects under a **Cartaisy-managed** Expo organization, on the reasoning that EAS is build machinery while Apple Developer is app identity. Both are true at once — Cartaisy-owned build infrastructure, merchant-owned store identity — and they are different questions. Don't collapse them.

## What the merchant must do

The merchant enrolls in the Apple Developer Program under their own account. Cartaisy can walk them through it as part of paid onboarding, but the account, the payment, and the legal agreement are theirs.

**Cost.** 99 USD per membership year, charged annually. Pricing varies by region and is shown in local currency during enrollment. Nonprofits, accredited educational institutions, and government entities may request a fee waiver.

**Individual vs. organization enrollment.** This choice has a consequence that matters commercially, and it should be surfaced during onboarding rather than discovered late.

Individual (or sole proprietor / single-person business) enrollment is the lighter path: an Apple Account with two-factor authentication, legal age of majority, and the enroller's personal legal name. The catch is that **the personal legal name is what appears as the seller on the App Store** — not a brand or trading name. For a merchant-branded storefront app that is usually the wrong outcome, so most real merchants want organization enrollment.

Organization enrollment requires materially more, and this is where the lead time lives:

- The organization must be a **legal entity** capable of entering contracts with Apple. Apple does not accept DBAs, fictitious businesses, trade names, or branches. The legal entity name appears as the seller.
- A **D-U-N-S Number**, the nine-digit business identifier issued by Dun & Bradstreet, is required for identity and legal-entity verification (government organizations excepted).
- The person enrolling must have **legal binding authority** — owner/founder, executive team member, senior project lead, or an employee explicitly granted that authority.
- A **work email address** on the organization's own domain.
- A **publicly available, functional website** on a domain associated with the organization. Social media pages, near-empty sites, and registrar parking pages are rejected.

**The D-U-N-S lead time.** If the merchant does not already have a D-U-N-S Number, Apple's lookup tool requests one from D&B. Apple's stated timings are up to **5 business days** to receive the number, plus up to **2 further business days** for Apple to receive the updated information from D&B before organization enrollment can proceed. Apple explicitly states that expediting the D-U-N-S creation process does not shorten this wait, and advises contacting D&B if the application takes longer than two weeks.

This is the single most important thing for sales and onboarding to internalise: **on the organization path, roughly a week of calendar time can elapse before Apple enrollment can even be submitted**, and none of it is under Cartaisy's control. Merchants who already hold a D-U-N-S Number skip it entirely, so asking early is worth it.

## What Cartaisy does once the account exists

The EAS credential mechanics are already documented and are not repeated here: see **`docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md` Step 3**, which now states plainly that the distribution certificate and provisioning profile are generated against the merchant-owned Apple Developer team.

What Step 3 does not currently cover, and what this section exists to flag:

**App Store Connect access.** Cartaisy staff need to be invited as users on the merchant's App Store Connect team with a role sufficient to upload builds and manage TestFlight. This is the per-merchant "credential/access handling" the 2026-07-17 decision anticipated. It also needs an offboarding counterpart — when a merchant leaves, that access is revoked, and the merchant keeps the account and the app. The runbook's offboarding path (already noted as required by the 2026-07-23 decision for keystores and bundle IDs) should cover App Store Connect access too.

**The App Store Connect app record.** Before any build can be uploaded, an app record must exist in the merchant's App Store Connect account, bound to a registered bundle identifier that matches the merchant's `IOS_BUNDLE_IDENTIFIER` from runbook Step 0. Bundle IDs are permanent once used — a typo here is not cheaply reversible, so it should be verified against the merchant record rather than typed from memory.

**Before a TestFlight build can be distributed**, the app record needs at minimum its platform and bundle ID set, a name, and the export-compliance question answered for the uploaded build. External testing needs materially more (see below). None of this requires the app to be ready for sale.

## Getting a build onto a physical device

Android's Phase 2 proof is straightforward: build an APK or development build and install it. **iOS has no equivalent** — a signed iOS build cannot simply be handed to a device the way an APK can. Two realistic paths exist, and they are not equivalent.

### TestFlight

The App Store Connect beta distribution channel. Two tiers:

**Internal testing** — up to **100 App Store Connect users** who have access to the app's content. Crucially, builds distributed only to internal testers **do not go through TestFlight App Review**, so the turnaround is upload → processing → install, with no Apple review gate.

**External testing** — up to **10,000 testers**, invited by email or public link. External distribution **does** require TestFlight App Review; a review is required for the first build of a version, and subsequent builds of that version may not need a full review.

Either way, a given build is testable for up to **90 days**, after which it becomes unavailable to testers.

### Ad hoc distribution

Signs the build against a set of specific devices registered by UDID in the merchant's Apple Developer account. No App Review of any kind, and no App Store Connect app record strictly required. The trade-offs are real: every target device's UDID must be collected and registered in advance, and registration is capped at **100 devices per product family per membership year**. That cap does not free up as you go — disabling a device mid-year does not restore capacity; the list can only be cleared at membership renewal, when the account holder is offered the option to remove devices and restore the count.

### Recommendation for the sample-merchant proof

**Use TestFlight internal testing as the default path.**

It clears the "installable on a physical device" bar without an Apple review gate, so it is nearly as fast as ad hoc in practice. It needs no UDID collection, which matters because collecting a UDID from a real merchant's own phone is an awkward onboarding step. It burns none of the finite 100-device-per-family annual allowance. And — the deciding reason — it exercises the exact path a real release will use: merchant-owned team, distribution signing, App Store Connect app record, build upload, processing. Ad hoc proves the build is signable; TestFlight proves the pipeline is the real one, and surfaces problems like a wrong bundle ID or missing App Store Connect access while they are still cheap.

Keep ad hoc in mind as the fallback for the narrow case where App Store Connect setup is blocked but the Apple team itself exists, or where a specific device cannot use TestFlight. Reserve external TestFlight for genuine pre-launch merchant/user testing, where the review gate is worth paying for the reach.

## Rough timeline estimate

**This is an estimate, not a schedule, and not a commitment.** It is assembled from Apple's published turnaround figures plus reasonable assumptions about the steps Apple does not publish timings for. Revisit and replace it with observed numbers the first time a real merchant account goes through.

| Stage | Rough duration | Notes |
| --- | --- | --- |
| D-U-N-S Number, if not already held | up to ~7 business days | 5 business days from D&B + up to 2 for Apple to receive it. Organization path only. Not expeditable. |
| Apple Developer Program enrollment review | days, occasionally longer | Apple publishes no committed turnaround. Legal-name and website mismatches are the common cause of delay. |
| App Store Connect app record + bundle ID | under an hour | Once enrolled. Blocked only on having the merchant record from runbook Step 0. |
| First EAS iOS build + interactive credential setup | hours | Runbook Step 3. Interactive on first run, largely automated afterwards. |
| TestFlight upload processing | minutes to hours | Internal testing needs no review, so this is the whole wait. |
| TestFlight App Review, external only | additional, variable | Only if external testing is in scope. Skipped for the internal-testing proof. |

Wall-clock, organization path with no existing D-U-N-S: plan for **roughly two to three weeks** before a build is on a merchant device, overwhelmingly dominated by enrollment rather than engineering. Individual path, or an organization that already holds a D-U-N-S Number: potentially a few days. The engineering portion in both cases is under a day.

Sales and onboarding conversations should quote the enrollment window honestly, and the enrollment ask should be the *first* thing raised with a merchant, not the last — it runs in parallel with everything else Cartaisy does.

## When this becomes actionable

This document is reference material. It becomes actionable when Daniyal or a merchant actually begins Apple Developer Program enrollment, and not before. Reading it does not commit anyone to anything, and nothing in it should be taken as instruction to create an Apple account, register a business, obtain a D-U-N-S Number, or spend money.

The first genuinely actionable moment is a merchant deciding to enroll. At that point the useful sequence is: confirm whether they already hold a D-U-N-S Number, confirm individual vs. organization and that they understand the seller-name consequence, then start enrollment while Cartaisy proceeds with everything in the provisioning runbook that does not depend on Apple.

## Sources

Apple facts above were verified against Apple's own documentation on 2026-07-28. Re-check before relying on the numbers — fees, limits, and requirements change.

- Program enrollment requirements: https://developer.apple.com/help/account/membership/program-enrollment/
- Fee and enrollment overview: https://developer.apple.com/programs/enroll/
- D-U-N-S Number and turnaround: https://developer.apple.com/help/account/membership/D-U-N-S
- TestFlight overview and tester limits: https://developer.apple.com/help/app-store-connect/test-a-beta-version/overview-of-testflight
- TestFlight App Review scope: https://developer.apple.com/help/glossary/testflight-app-review/
- Device registration limits: https://developer.apple.com/help/account/devices/devices-overview

## Related Docs

- `docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md` — the step-by-step provisioning process; Step 3 covers iOS signing.
- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` — the release checklist a branded build is verified against.
- `docs/MOBILE_ENV_VARIABLES.md` — authoritative reference for `IOS_BUNDLE_IDENTIFIER` and the rest of the merchant identity variables.
- `docs/DECISIONS.md` (this repo) and `cartaisy-backend` repo `docs/DECISIONS.md` — the 2026-07-17 account-ownership decision and the 2026-07-23 Expo org decision.
- `docs/cartaisy/ROADMAP.md` (backend repo) — Phase 2, item 3.
