import * as fs from "fs";
import * as path from "path";

// cartaisy-backend dispatches this file by name and validates inputs against
// the workflow_dispatch schema. The input names and the type: build jobs are
// the contract. See docs/EAS_STORE_BUILD_WORKFLOW.md.

const repoRoot = path.join(__dirname, "..", "..");
const workflowPath = path.join(repoRoot, ".eas", "workflows", "store-build.yml");

const read = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

const inputBlock = (workflow: string, name: string) => {
  const match = workflow.match(
    new RegExp(`^      ${name}:\\n((?:        .+\\n)*)`, "m")
  );
  if (!match) {
    throw new Error(`Missing workflow input ${name}`);
  }
  return match[1];
};

const jobBlock = (workflow: string, name: string) => {
  const match = workflow.match(
    new RegExp(`^  ${name}:\\n((?:    .+\\n)*)`, "m")
  );
  if (!match) {
    throw new Error(`Missing workflow job ${name}`);
  }
  return match[1];
};

describe("EAS store-build workflow", () => {
  const workflow = read(".eas/workflows/store-build.yml");

  it("lives at the file name the backend dispatches", () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
    expect(path.basename(workflowPath)).toBe("store-build.yml");
  });

  it("declares the backend input names and which ones are required", () => {
    expect(workflow).toContain("workflow_dispatch:");

    const platform = inputBlock(workflow, "platform");
    expect(platform).toContain("type: choice");
    expect(platform).toContain("required: true");
    expect(platform).toContain("- ios");
    expect(platform).toContain("- android");

    expect(inputBlock(workflow, "storeId")).toContain("required: true");

    for (const name of ["appName", "storeSlug", "iconUrl", "splashUrl"]) {
      expect(inputBlock(workflow, name)).toContain("required: false");
      expect(inputBlock(workflow, name)).toContain("type: string");
    }
  });

  it("builds only the requested platform with the internal preview profile", () => {
    const ios = jobBlock(workflow, "build_ios");
    const android = jobBlock(workflow, "build_android");

    expect(ios).toContain("type: build");
    expect(ios).toContain("if: ${{ inputs.platform == 'ios' }}");
    expect(ios).toContain("platform: ios");
    expect(ios).toContain("profile: preview");
    expect(ios).toContain("environment: preview");

    expect(android).toContain("type: build");
    expect(android).toContain("if: ${{ inputs.platform == 'android' }}");
    expect(android).toContain("platform: android");
    expect(android).toContain("profile: preview");
    expect(android).toContain("environment: preview");

    expect(workflow).not.toContain("type: submit");
  });

  it("maps store inputs onto the env names app.config.ts already reads", () => {
    for (const jobName of ["build_ios", "build_android"]) {
      const job = jobBlock(workflow, jobName);
      expect(job).toContain("EXPO_PUBLIC_STORE_ID: ${{ inputs.storeId }}");
      expect(job).toContain("APP_NAME: ${{ inputs.appName }}");
      expect(job).toContain("EXPO_PUBLIC_APP_NAME: ${{ inputs.appName }}");
      expect(job).toContain("APP_SLUG: ${{ inputs.storeSlug }}");
      expect(job).toContain("ICON_IMAGE_URL: ${{ inputs.iconUrl }}");
      expect(job).toContain("SPLASH_IMAGE_URL: ${{ inputs.splashUrl }}");
    }
  });

  it("does not commit an Expo token or replace the Cartaisy project default", () => {
    expect(workflow).not.toMatch(/EXPO_TOKEN|shpat_|sk_live|BEGIN PRIVATE/);
    expect(workflow).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );

    const appConfig = read("app.config.ts");
    expect(appConfig).toContain(
      '["EAS_PROJECT_ID"],\n  "eabf3411-284b-4bd8-88eb-8d89a8a4ee14"'
    );
    expect(appConfig).toContain('["EXPO_OWNER"], "rendernext"');

    const eas = JSON.parse(read("eas.json")) as {
      build: {
        preview: {
          distribution: string;
          android: { buildType: string };
        };
      };
    };
    expect(eas.build.preview.distribution).toBe("internal");
    expect(eas.build.preview.android.buildType).toBe("apk");
  });
});
