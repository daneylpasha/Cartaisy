import { mkdtemp, readFile, writeFile } from "fs/promises";
import * as os from "os";
import * as path from "path";
import { sniffImageKind } from "../resolveNativeSplash";
import {
  CARTAISY_ADAPTIVE_ICON,
  CARTAISY_ICON_IMAGE,
  NEUTRAL_ICON_IMAGE,
  downloadPublicIcon,
  isSafePublicIconUrl,
  resolveAdaptiveIconForeground,
  resolveNativeIcon,
} from "../resolveNativeIcon";

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

describe("resolveNativeIcon", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps the Cartaisy icon when the default identity sets no icon", async () => {
    const resolved = await resolveNativeIcon({ env: {}, repoRoot });

    expect(resolved).toEqual({
      image: CARTAISY_ICON_IMAGE,
      source: "cartaisy-default",
    });
    expect(resolved.image).not.toContain("cartaisy-color-logo");
  });

  it("uses a neutral icon for a merchant build with no icon asset", async () => {
    const resolved = await resolveNativeIcon({
      env: merchantEnv,
      repoRoot,
    });

    expect(resolved).toEqual({
      image: NEUTRAL_ICON_IMAGE,
      source: "neutral",
    });
    expect(resolved.image).not.toContain("cartaisy");
  });

  it("ships a neutral icon that is a PNG and not the Cartaisy wordmark", async () => {
    const bytes = await readFile(path.join(repoRoot, NEUTRAL_ICON_IMAGE));

    expect(sniffImageKind(bytes)).toBe("png");
    expect(bytes.includes(Buffer.from("cartaisy"))).toBe(false);
  });

  it("uses a merchant PNG from ICON_IMAGE_PATH", async () => {
    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_PATH: "./assets/images/acme-outfitters-logo.png",
      },
      repoRoot,
    });

    expect(resolved).toEqual({
      image: "./assets/images/acme-outfitters-logo.png",
      source: "local-file",
    });
  });

  it("prefers ICON_IMAGE_PATH over ICON_IMAGE_URL", async () => {
    const download = jest.fn(() => "./assets/images/neutral-icon.png");

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_PATH: "./assets/images/acme-outfitters-logo.png",
        ICON_IMAGE_URL: "https://cdn.example.com/stores/acme/icon.png",
      },
      repoRoot,
      download,
    });

    expect(download).not.toHaveBeenCalled();
    expect(resolved.source).toBe("local-file");
  });

  it("does not read EXPO_PUBLIC_ICON_IMAGE_URL", async () => {
    const download = jest.fn(() => "./assets/images/neutral-icon.png");

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        EXPO_PUBLIC_ICON_IMAGE_URL:
          "https://cdn.example.com/stores/acme/icon.png",
        EXPO_PUBLIC_ICON_IMAGE_PATH: "./assets/images/acme-outfitters-logo.png",
      },
      repoRoot,
      download,
    });

    expect(download).not.toHaveBeenCalled();
    expect(resolved).toEqual({
      image: NEUTRAL_ICON_IMAGE,
      source: "neutral",
    });
  });

  it("accepts an absolute icon file for an EAS file environment variable", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "icon-file-"));
    const iconFile = path.join(directory, "merchant-icon.png");
    await writeFile(iconFile, TINY_PNG);

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_PATH: iconFile,
      },
      repoRoot,
    });

    expect(resolved).toEqual({
      image: iconFile,
      source: "local-file",
    });
  });

  it("fail-closes to the neutral icon when the icon file is missing", async () => {
    const download = jest.fn(() => "./assets/images/acme-outfitters-logo.png");

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_PATH: "./assets/images/missing-merchant-icon.png",
        ICON_IMAGE_URL: "https://cdn.example.com/stores/acme/icon.png",
      },
      repoRoot,
      download,
    });

    expect(download).not.toHaveBeenCalled();
    expect(resolved.source).toBe("neutral");
    expect(resolved.image).toBe(NEUTRAL_ICON_IMAGE);
  });

  it("fail-closes when a relative icon path escapes the repo", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "icon-outside-"));
    const iconFile = path.join(directory, "outside.png");
    await writeFile(iconFile, TINY_PNG);
    const escaped = path.relative(repoRoot, iconFile);

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_PATH: escaped,
      },
      repoRoot,
    });

    expect(escaped.startsWith("..")).toBe(true);
    expect(resolved.source).toBe("neutral");
  });

  it("downloads a public https icon and does not fall back to the wordmark", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "icon-download-"));
    const downloaded = path.join(directory, "icon.png");
    await writeFile(downloaded, TINY_PNG);
    const download = jest.fn(() => downloaded);

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_URL: "https://cdn.example.com/stores/acme/icon.png",
      },
      repoRoot,
      download,
    });

    expect(download).toHaveBeenCalledWith(
      "https://cdn.example.com/stores/acme/icon.png"
    );
    expect(resolved).toEqual({
      image: downloaded,
      source: "downloaded-url",
    });
  });

  it("fail-closes when the https icon cannot be downloaded", async () => {
    const download = jest.fn(() => {
      throw new Error("network down");
    });

    const resolved = await resolveNativeIcon({
      env: {
        ...merchantEnv,
        ICON_IMAGE_URL: "https://cdn.example.com/stores/acme/missing.png",
      },
      repoRoot,
      download,
    });

    expect(resolved.source).toBe("neutral");
    expect(resolved.image).not.toContain("cartaisy");
  });

  it("rejects credentialed and non-https icon URLs before downloading", async () => {
    const download = jest.fn(() => "./assets/images/neutral-icon.png");

    const cases = [
      "http://cdn.example.com/icon.png",
      "https://user:shpat_secret@cdn.example.com/icon.png",
      "https://cdn.example.com/icon.png?access_token=shpat_secret",
      "https://cdn.example.com/icon.png?token=abc",
      "https://127.0.0.1/icon.png",
      "not a url",
    ];

    for (const iconUrl of cases) {
      expect(isSafePublicIconUrl(iconUrl)).toBe(false);
      const resolved = await resolveNativeIcon({
        env: { ...merchantEnv, ICON_IMAGE_URL: iconUrl },
        repoRoot,
        download,
      });
      expect(resolved.source).toBe("neutral");
    }

    expect(download).not.toHaveBeenCalled();
  });

  it("treats a non-default bundle id as a merchant build even when the slug is unset", async () => {
    const resolved = await resolveNativeIcon({
      env: { EXPO_PUBLIC_ANDROID_PACKAGE: "com.example.acmeoutfitters" },
      repoRoot,
    });

    expect(resolved.source).toBe("neutral");
  });
});

describe("resolveAdaptiveIconForeground", () => {
  it("keeps the Cartaisy adaptive icon for the default identity", () => {
    const foreground = resolveAdaptiveIconForeground({
      env: {},
      repoRoot,
      launcherImage: CARTAISY_ICON_IMAGE,
    });

    expect(foreground).toBe(CARTAISY_ADAPTIVE_ICON);
  });

  it("uses a merchant adaptive file when one is set", () => {
    const foreground = resolveAdaptiveIconForeground({
      env: {
        ...merchantEnv,
        ANDROID_ADAPTIVE_ICON_PATH:
          "./assets/images/acme-outfitters-adaptive-icon.png",
      },
      repoRoot,
      launcherImage: "./assets/images/acme-outfitters-logo.png",
    });

    expect(foreground).toBe("./assets/images/acme-outfitters-adaptive-icon.png");
  });

  it("does not keep the Cartaisy adaptive wordmark on a merchant build", () => {
    const foreground = resolveAdaptiveIconForeground({
      env: {
        ...merchantEnv,
        ANDROID_ADAPTIVE_ICON_PATH: CARTAISY_ADAPTIVE_ICON,
      },
      repoRoot,
      launcherImage: NEUTRAL_ICON_IMAGE,
    });

    expect(foreground).toBe(NEUTRAL_ICON_IMAGE);
    expect(foreground).not.toContain("adaptive-icon");
  });
});

describe("downloadPublicIcon", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("writes a PNG from a public https response without an auth header", async () => {
    const cacheDir = await mkdtemp(path.join(os.tmpdir(), "icon-cache-"));
    const fetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>(
      async () => {
        return new Response(TINY_PNG, {
          status: 200,
          headers: { "content-type": "image/png" },
        });
      }
    );
    global.fetch = fetchMock as typeof fetch;

    const downloaded = await downloadPublicIcon(
      "https://cdn.example.com/stores/acme/icon.png",
      cacheDir
    );

    expect(downloaded.endsWith(".png")).toBe(true);
    expect(downloaded.startsWith(cacheDir)).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://cdn.example.com/stores/acme/icon.png",
      expect.objectContaining({
        method: "GET",
        redirect: "follow",
        headers: { Accept: "image/png,image/jpeg" },
      })
    );
    const init = fetchMock.mock.calls[0][1];
    expect(init?.headers).toEqual({ Accept: "image/png,image/jpeg" });
    expect(JSON.stringify(init?.headers).toLowerCase()).not.toContain(
      "authorization"
    );
  });

  it("rejects an HTML response body", async () => {
    const cacheDir = await mkdtemp(path.join(os.tmpdir(), "icon-html-"));
    global.fetch = jest.fn(async () => {
      return new Response("<html>login</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }) as typeof fetch;

    await expect(
      downloadPublicIcon("https://cdn.example.com/icon.png", cacheDir)
    ).rejects.toThrow(/PNG or JPEG/);
  });

  it("does not send a request for a Shopify token URL", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(
      downloadPublicIcon(
        "https://cdn.example.com/icon.png?access_token=shpat_secret"
      )
    ).rejects.toThrow(/Rejected/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("app.config native icon", () => {
  const envSnapshot = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

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

  const loadIcons = async () => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest cannot dynamic-import app.config.ts here.
    const loaded = require("../../app.config") as {
      default: {
        icon?: string;
        android?: { adaptiveIcon?: { foregroundImage?: string } };
        web?: { favicon?: string };
      };
    };
    const config = loaded.default;
    return {
      icon: config.icon,
      adaptiveForeground: config.android?.adaptiveIcon?.foregroundImage,
      favicon: config.web?.favicon,
    };
  };

  it("points a merchant build with no usable icon at the neutral asset", async () => {
    process.env.APP_NAME = "Acme Outfitters";
    process.env.APP_SLUG = "acme-outfitters";
    process.env.IOS_BUNDLE_IDENTIFIER = "com.example.acmeoutfitters";
    process.env.ANDROID_PACKAGE = "com.example.acmeoutfitters";
    process.env.ANDROID_ADAPTIVE_ICON_PATH = CARTAISY_ADAPTIVE_ICON;
    process.env.APP_ICON_PATH = "./assets/images/cartaisy-color-logo.png";
    delete process.env.ICON_IMAGE_PATH;
    delete process.env.ICON_IMAGE_URL;
    delete process.env.SPLASH_IMAGE_PATH;
    delete process.env.SPLASH_IMAGE_URL;

    const icons = await loadIcons();

    expect(icons.icon).toBe(NEUTRAL_ICON_IMAGE);
    expect(icons.adaptiveForeground).toBe(NEUTRAL_ICON_IMAGE);
    expect(icons.icon).not.toContain("cartaisy");
    expect(icons.favicon).toBe("./assets/images/cartaisy-color-logo.png");
  });

  it("resolves ICON_IMAGE_PATH for the launcher icon", async () => {
    process.env.APP_SLUG = "acme-outfitters";
    process.env.IOS_BUNDLE_IDENTIFIER = "com.example.acmeoutfitters";
    process.env.ANDROID_PACKAGE = "com.example.acmeoutfitters";
    process.env.ICON_IMAGE_PATH = "./assets/images/acme-outfitters-logo.png";
    process.env.ANDROID_ADAPTIVE_ICON_PATH =
      "./assets/images/acme-outfitters-adaptive-icon.png";
    delete process.env.ICON_IMAGE_URL;
    delete process.env.SPLASH_IMAGE_URL;

    const icons = await loadIcons();

    expect(icons.icon).toBe("./assets/images/acme-outfitters-logo.png");
    expect(icons.adaptiveForeground).toBe(
      "./assets/images/acme-outfitters-adaptive-icon.png"
    );
  });

  it("keeps the Cartaisy icon for the default identity", async () => {
    delete process.env.APP_SLUG;
    delete process.env.IOS_BUNDLE_IDENTIFIER;
    delete process.env.EXPO_PUBLIC_IOS_BUNDLE_ID;
    delete process.env.ANDROID_PACKAGE;
    delete process.env.EXPO_PUBLIC_ANDROID_PACKAGE;
    delete process.env.ICON_IMAGE_PATH;
    delete process.env.ICON_IMAGE_URL;
    delete process.env.ANDROID_ADAPTIVE_ICON_PATH;
    delete process.env.SPLASH_IMAGE_PATH;
    delete process.env.SPLASH_IMAGE_URL;

    const icons = await loadIcons();

    expect(icons.icon).toBe(CARTAISY_ICON_IMAGE);
    expect(icons.adaptiveForeground).toBe(CARTAISY_ADAPTIVE_ICON);
  });
});
