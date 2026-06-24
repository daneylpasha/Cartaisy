# Cartaisy Agent Instructions

These rules apply to the entire repository.

## Branching and PR scope

- Do not push directly to `main` or `staging`.
- Work from a feature branch for each GitHub issue.
- Keep pull requests small, focused, and limited to what the issue asks for.
- Do not make broad refactors, formatting-only sweeps, dependency churn, or unrelated cleanup.
- Do not change application code for documentation-only issues.
- Temporary GitHub issue body files such as `issue-*.md` are only for creating GitHub issues locally and must not be committed. Remove them before opening a pull request.

## Secrets and environment safety

- Do not modify production secrets or committed environment files unless the issue explicitly asks for it.
- Do not commit credentials, access tokens, private keys, `.env` files, or merchant-specific secrets.
- Do not expose Shopify tokens or Shopify admin credentials to the mobile application.
- If a secret appears in the repository or in a diff, stop and flag it rather than copying it elsewhere.

## High-risk application areas

- Do not change checkout, payment, auth, auth refresh, dashboard, backend architecture, or tenant-isolation logic unless the GitHub issue explicitly asks for it.
- Treat checkout, payment, authentication, tenant isolation, and Shopify credential handling as security-sensitive areas.
- Keep changes to these areas minimal and add tests when backend logic changes.

## Tenant and Shopify data rules

- Every Shopify API call must use store-specific credentials for the store being served.
- Every tenant-owned backend query must include `storeId` or an equivalent store-scoping constraint.
- Do not add merchant-specific code branches, hard-coded merchant IDs, or store-specific behavior outside configuration.
- Do not share data across stores or tenants.

## Validation

- Run the available checks before opening a pull request.
- Add or update tests when changing backend logic.
- Document any skipped checks and the reason in the PR.

## AI-generated pull request checklist

Every AI-generated PR summary must include:

- Summary
- Changed files
- Commands run
- Risks
- Follow-up TODOs
