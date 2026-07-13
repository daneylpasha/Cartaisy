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

// Returns true when a gitignore-style rule would exclude a file that lives at
// the repo root, including glob rules such as "*.plist". Negated ("!") rules
// re-include rather than exclude, and directory-only rules (trailing "/")
// cannot match a file, so both return false.
const ruleExcludesRootFile = (rule: string, fileName: string) => {
  if (rule.startsWith("!") || rule.endsWith("/")) {
    return false;
  }

  // For a root-level file, an anchored rule ("/name"), a basename rule
  // ("name"), and a "**/name" rule all reduce to matching the file name.
  const pattern = rule.replace(/^\//, "").replace(/^\*\*\//, "");

  if (pattern.includes("/")) {
    return false;
  }

  // "**" goes through a placeholder so the single-"*" replacement cannot
  // corrupt the ".*" it expands to.
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\\([^*?])/g, "$1")
        .replace(/[.+^${}()|[\]]/g, "\\$&")
        .replace(/\*\*/g, "\u0000")
        .replace(/\*/g, "[^/]*")
        .replace(/\?/g, "[^/]")
        .replace(/\u0000/g, ".*") +
      "$"
  );

  return regex.test(fileName);
};

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

  it("keeps generated local report artifacts out of EAS build archives", () => {
    expect(rules).toContain("output");
    expect(rules).toContain("cartaisy-*-status-report-*.md");
    expect(rules).toContain("cartaisy-*-status-report-*.pdf");
  });

  it("keeps signing and credential file patterns out of EAS build archives", () => {
    for (const pattern of ["*.keystore", "*.jks", "*.p8", "*.p12", "*.key", "*.mobileprovision", "*.pem"]) {
      expect(rules).toContain(pattern);
    }
  });

  it("does not exclude the committed Cartaisy default Firebase config files", () => {
    // Cartaisy default EAS builds prebuild on the worker and need these files
    // in the archive. Check every rule as a glob, not just exact names, so a
    // pattern like "*.plist" or "*.json" cannot slip in unnoticed.
    for (const fileName of ["GoogleService-Info.plist", "google-services.json"]) {
      const excludingRules = rules.filter((rule) => ruleExcludesRootFile(rule, fileName));
      expect(excludingRules).toEqual([]);
    }
  });

  it("mirrors every .gitignore rule so replacing .gitignore for EAS uploads loses nothing", () => {
    // Intentionally one-directional: .easignore is a superset of .gitignore
    // (it adds /ios and /android). New security-relevant patterns must be
    // added to .gitignore first, which this test then forces into .easignore.
    const gitignoreRules = readIgnoreRules(".gitignore");
    const missing = gitignoreRules.filter((rule) => !rules.includes(rule));
    expect(missing).toEqual([]);
  });
});
