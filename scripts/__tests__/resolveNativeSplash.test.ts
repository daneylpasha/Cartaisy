import { mkdtemp, writeFile } from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  CARTAISY_SPLASH_IMAGE,
  NEUTRAL_SPLASH_IMAGE,
  downloadPublicSplash,
  isSafePublicSplashUrl,
  resolveNativeSplash,
} from "../resolveNativeSplash";

const repoRoot = path.resolve(__dirname, "..", "..");

const merchantEnv = {
  APP_SLUG: "acme-outfitters",
  IOS_BUNDLE_IDENTIFIER: "com.example.acmeoutfitters",
  ANDROID_PACKAGE: "com.example.acmeoutfitters",
};

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

describe("resolveNativeSplash", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps the Cartaisy wordmark when the default identity sets no splash", async () => {
    const resolved = await resolveNativeSplash({ env: {}, repoRoot });

    expect(resolved).toEqual({
      image: CARTAISY_SPLASH_IMAGE,
      source: "cartaisy-default",
    });
  });

  it("uses a neutral splash for a merchant build with no splash asset", async () => {
    const resolved = await resolveNativeSplash({
      env: merchantEnv,
      repoRoot,
    });

    expect(resolved).toEqual({
      image: NEUTRAL_SPLASH_IMAGE,
      source: "neutral",
    });
    expect(resolved.image).not.toContain("cartaisy-color-logo");
  });

  it("uses a merchant PNG from SPLASH_IMAGE_PATH", async () => {
    const resolved = await resolveNativeSplash({
      env: {
        ...merchantEnv,
        SPLASH_IMAGE_PATH: "./assets/images/acme-outfitters-logo.png",
      },
      repoRoot,
    });

    expect(resolved).toEqual({
      image: "./assets/images/acme-outfitters-logo.png",
      source: "local-file",
    });
  });

  it("accepts an absolute splash file for an EAS file environment variable", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "splash-file-"));
    const splashFile = path.join(directory, "merchant-splash.png");
    await writeFile(splashFile, TINY_PNG);

    const resolved = await resolveNativeSplash({
      env: {
        ...merchantEnv,
        SPLASH_IMAGE_PATH: splashFile,
      },
      repoRoot,
    });

    expect(resolved).toEqual({
      image: splashFile,
      source: "local-file",
    });
  });

  it("fail-closes to the neutral splash when the splash file is missing", async () => {
    const resolved = await resolveNativeSplash({
      env: {
        ...merchantEnv,
        SPLASH_IMAGE_PATH: "./assets/images/missing-merchant-splash.png",
      },
      repoRoot,
    });

    expect(resolved.source).toBe("neutral");
    expect(resolved.image).toBe(NEUTRAL_SPLASH_IMAGE);
  });

  it("fail-closes when a relative splash path escapes the repo", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "splash-outside-"));
    const splashFile = path.join(directory, "outside.png");
    await writeFile(splashFile, TINY_PNG);
    const escaped = path.relative(repoRoot, splashFile);

    const resolved = await resolveNativeSplash({
      env: {
        ...merchantEnv,
        SPLASH_IMAGE_PATH: escaped,
      },
      repoRoot,
    });

    expect(escaped.startsWith("..")).toBe(true);
    expect(resolved.source).toBe("neutral");
  });

  it("downloads a public https splash and does not fall back to the wordmark", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "splash-download-"));
    const downloaded = path.join(directory, "splash.png");
    await writeFile(downloaded, TINY_PNG);
    const download = jest.fn(() => downloaded);

    const resolved = await resolveNativeSplash({
      env: {
        ...merchantEnv,
        SPLASH_IMAGE_URL: "https://cdn.example.com/stores/acme/splash.png",
      },
      repoRoot,
      download,
    });

    expect(download).toHaveBeenCalledWith(
      "https://cdn.example.com/stores/acme/splash.png"
    );
    expect(resolved).toEqual({
      image: downloaded,
      source: "downloaded-url",
    });
  });

  it("fail-closes when the https splash cannot be downloaded", async () => {
    const download = jest.fn(() => {
      throw new Error("network down");
    });

    const resolved = await resolveNativeSplash({
      env: {
        ...merchantEnv,
        SPLASH_IMAGE_URL: "https://cdn.example.com/stores/acme/missing.png",
      },
      repoRoot,
      download,
    });

    expect(resolved.source).toBe("neutral");
    expect(resolved.image).not.toContain("cartaisy");
  });

  it("rejects credentialed and non-https splash URLs before downloading", async () => {
    const download = jest.fn(() => "./assets/images/neutral-splash.png");

    const cases = [
      "http://cdn.example.com/splash.png",
      "https://user:shpat_secret@cdn.example.com/splash.png",
      "https://cdn.example.com/splash.png?access_token=shpat_secret",
      "https://cdn.example.com/splash.png?token=abc",
      "https://127.0.0.1/splash.png",
      "not a url",
    ];

    for (const splashUrl of cases) {
      expect(isSafePublicSplashUrl(splashUrl)).toBe(false);
      const resolved = await resolveNativeSplash({
        env: { ...merchantEnv, SPLASH_IMAGE_URL: splashUrl },
        repoRoot,
        download,
      });
      expect(resolved.source).toBe("neutral");
    }

    expect(download).not.toHaveBeenCalled();
  });

  it("treats a non-default bundle id as a merchant build even when the slug is unset", async () => {
    const resolved = await resolveNativeSplash({
      env: { EXPO_PUBLIC_ANDROID_PACKAGE: "com.example.acmeoutfitters" },
      repoRoot,
    });

    expect(resolved.source).toBe("neutral");
  });
});

describe("downloadPublicSplash", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("writes a PNG from a public https response", async () => {
    const cacheDir = await mkdtemp(path.join(os.tmpdir(), "splash-cache-"));
    global.fetch = jest.fn(async () => {
      return new Response(TINY_PNG, {
        status: 200,
        headers: { "content-type": "image/png" },
      });
    }) as typeof fetch;

    const downloaded = await downloadPublicSplash(
      "https://cdn.example.com/stores/acme/splash.png",
      cacheDir
    );

    expect(downloaded.endsWith(".png")).toBe(true);
    expect(downloaded.startsWith(cacheDir)).toBe(true);
  });

  it("rejects an HTML response body", async () => {
    const cacheDir = await mkdtemp(path.join(os.tmpdir(), "splash-html-"));
    global.fetch = jest.fn(async () => {
      return new Response("<html>login</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }) as typeof fetch;

    await expect(
      downloadPublicSplash("https://cdn.example.com/splash.png", cacheDir)
    ).rejects.toThrow(/PNG or JPEG/);
  });

  it("does not send a request for a Shopify token URL", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(
      downloadPublicSplash(
        "https://cdn.example.com/splash.png?access_token=shpat_secret"
      )
    ).rejects.toThrow(/Rejected/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("app.config native splash", () => {
  const envSnapshot = { ...process.env };
  const originalFetch = global.fetch;

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in envSnapshot)) {
        delete process.env[key];
      }
    }
    for (const [key, value] of Object.entries(envSnapshot)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    global.fetch = originalFetch;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  const loadSplashImage = async () => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest cannot dynamic-import app.config.ts here.
    const loaded = require("../../app.config") as {
      default: { plugins?: unknown[] };
    };
    const config = loaded.default;
    const plugin = config.plugins?.find(
      (entry) => Array.isArray(entry) && entry[0] === "expo-splash-screen"
    );
    if (!plugin || !Array.isArray(plugin)) {
      throw new Error("expo-splash-screen plugin missing");
    }
    return (plugin[1] as { image?: string }).image;
  };

  it("points the sample merchant https splash at the neutral asset when download fails", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    process.env.APP_NAME = "Acme Outfitters";
    process.env.APP_SLUG = "acme-outfitters";
    process.env.IOS_BUNDLE_IDENTIFIER = "com.example.acmeoutfitters";
    process.env.ANDROID_PACKAGE = "com.example.acmeoutfitters";
    process.env.SPLASH_IMAGE_URL =
      "https://cdn.example.com/stores/acme-outfitters/splash.png";
    process.env.SPLASH_BACKGROUND_COLOR = "#0A2540";
    delete process.env.SPLASH_IMAGE_PATH;

    const image = await loadSplashImage();

    expect(image).toBe(NEUTRAL_SPLASH_IMAGE);
    expect(image).not.toContain("cartaisy-color-logo");
  });

  it("keeps the Cartaisy wordmark for the default identity", async () => {
    delete process.env.APP_SLUG;
    delete process.env.IOS_BUNDLE_IDENTIFIER;
    delete process.env.EXPO_PUBLIC_IOS_BUNDLE_ID;
    delete process.env.ANDROID_PACKAGE;
    delete process.env.EXPO_PUBLIC_ANDROID_PACKAGE;
    delete process.env.SPLASH_IMAGE_PATH;
    delete process.env.SPLASH_IMAGE_URL;

    const image = await loadSplashImage();

    expect(image).toBe(CARTAISY_SPLASH_IMAGE);
  });
});
