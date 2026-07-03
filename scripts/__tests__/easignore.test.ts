import * as fs from "fs";
import * as path from "path";

// .easignore replaces .gitignore for EAS build archive filtering, so these
// rules decide what reaches the EAS build worker. If they drift, merchant
// builds can silently ship Cartaisy native identity (GitHub issue #60) or
// local env files can be uploaded. See docs/DECISIONS.md.

const repoRoot = path.join(__dirname, "..", "..");

const readIgnoreRules = (fileName: string) =>
  fs
    .readFileSync(path.join(repoRoot, fileName), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

describe(".easignore EAS build archive rules", () => {
  const rules = readIgnoreRules(".easignore");

  it("excludes the checked-in native projects so EAS builds regenerate them from app.config.ts", () => {
    expect(rules).toContain("/ios");
    expect(rules).toContain("/android");
  });

  it("keeps local env files out of EAS build archives", () => {
    expect(rules).toContain(".env");
    expect(rules).toContain(".env*.local");
  });

  it("keeps node_modules out of EAS build archives", () => {
    expect(rules).toContain("node_modules/");
  });

  it("keeps signing and credential file patterns out of EAS build archives", () => {
    for (const pattern of ["*.keystore", "*.jks", "*.p8", "*.p12", "*.key", "*.mobileprovision", "*.pem"]) {
      expect(rules).toContain(pattern);
    }
  });

  it("does not exclude the committed Cartaisy default Firebase config files", () => {
    expect(rules).not.toContain("GoogleService-Info.plist");
    expect(rules).not.toContain("google-services.json");
  });

  it("mirrors every .gitignore rule so replacing .gitignore for EAS uploads loses nothing", () => {
    const gitignoreRules = readIgnoreRules(".gitignore");
    const missing = gitignoreRules.filter((rule) => !rules.includes(rule));
    expect(missing).toEqual([]);
  });
});
