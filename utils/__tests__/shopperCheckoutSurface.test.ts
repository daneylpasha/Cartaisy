import fs from "fs";
import path from "path";

import { isLegacyNativeCheckoutEnabled } from "@/utils/checkoutFlowGate";

const repoRoot = path.resolve(__dirname, "../..");

const shopperRoots = ["app", "components"].map((dir) =>
  path.join(repoRoot, dir)
);

const forbiddenSnippets = [
  "@stripe/stripe-react-native",
  "EXPO_PUBLIC_STRIPE",
  "createPlatformPayPaymentMethod",
  "CardField",
  "useStripe(",
  "usePlatformPay(",
  "initPaymentSheet",
  "presentPaymentSheet",
  "useCompleteCheckout",
];

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "__tests__") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, acc);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

describe("shopper checkout surface", () => {
  it("keeps native checkout fail-closed without an environment switch", () => {
    expect(isLegacyNativeCheckoutEnabled()).toBe(false);

    const gateSource = fs.readFileSync(
      path.join(repoRoot, "utils/checkoutFlowGate.ts"),
      "utf8"
    );
    expect(gateSource).not.toMatch(/process\.env/);
    expect(gateSource).not.toMatch(/EXPO_PUBLIC_/);
  });

  it("has no shopper screen that can collect a Stripe card or confirm payment", () => {
    const offenders: string[] = [];

    for (const root of shopperRoots) {
      for (const filePath of collectSourceFiles(root)) {
        const source = fs.readFileSync(filePath, "utf8");
        const hits = forbiddenSnippets.filter((snippet) =>
          source.includes(snippet)
        );
        if (hits.length > 0) {
          offenders.push(
            `${path.relative(repoRoot, filePath)}: ${hits.join(", ")}`
          );
        }
      }
    }

    expect(offenders).toEqual([]);
    expect(
      fs.existsSync(path.join(repoRoot, "app/addNewCardDetails.tsx"))
    ).toBe(false);
    expect(fs.existsSync(path.join(repoRoot, "app/paymentMethod.tsx"))).toBe(
      false
    );
    expect(fs.existsSync(path.join(repoRoot, "app/order-success.tsx"))).toBe(
      false
    );
  });
});
