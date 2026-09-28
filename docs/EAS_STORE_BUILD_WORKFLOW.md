# EAS store build workflow

`cartaisy-backend` starts an EAS Workflow run when a store admin requests a build and the API process has `EXPO_TOKEN`, `EAS_PROJECT_ID`, and `EAS_WORKFLOW_FILE`. The workflow file lives in this repository. The backend sends the file name only.

Set this on the API process (Railway). Do not commit `EXPO_TOKEN`.

| Variable | Value |
| --- | --- |
| `EAS_WORKFLOW_FILE` | `store-build.yml` |
| `EAS_PROJECT_ID` | `eabf3411-284b-4bd8-88eb-8d89a8a4ee14` |
| `EXPO_TOKEN` | Robot token for the Expo account that owns the Cartaisy project. Not stored in this repo. |
| `EAS_GIT_REF` | Optional. Branch, tag, or commit. The backend defaults to `main`. |

`app.config.ts` already defaults `EAS_PROJECT_ID` to that project id and `EXPO_OWNER` to `rendernext`. This workflow does not change those defaults and does not add a token.

## What the backend sends

The backend calls `POST https://api.expo.dev/v2/workflows/dispatch` with `fileName: store-build.yml` and one run per requested platform. The input names are fixed:

| Input | Required | Passed into the build as |
| --- | --- | --- |
| `platform` | yes (`ios` or `android`) | The `type: build` job for that platform |
| `storeId` | yes | `EXPO_PUBLIC_STORE_ID` |
| `appName` | no | `APP_NAME` and `EXPO_PUBLIC_APP_NAME` |
| `storeSlug` | no | `APP_SLUG` |
| `iconUrl` | no | `ICON_IMAGE_URL` |
| `splashUrl` | no | `SPLASH_IMAGE_URL` |

Optional inputs are omitted when the store has no usable value. An empty value is treated as unset by `app.config.ts`, which then keeps its Cartaisy default for that field.

The workflow runs the matching job (`build_ios` or `build_android`). Both jobs are `type: build` and use the `preview` profile in `eas.json`. That profile is `distribution: internal`, and Android builds an APK, so Expo can return an install URL. The backend later reads that URL from the build and stores it on the request. This file does not submit to the App Store or Play Store.

Bundle id, Android package, and URL scheme stay on the `app.config.ts` defaults. Per-store bundle ids are out of scope for this file. The manual per-merchant EAS project checklist in `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` is unchanged.

Icon and splash URLs must already be public `https` URLs with no credentials. `app.config.ts` downloads them while config evaluates on the EAS worker. A missing or rejected image uses the neutral asset on a non-default identity.

Signing credentials for the `preview` profile must already exist on the Cartaisy Expo project. This repository does not store them.
