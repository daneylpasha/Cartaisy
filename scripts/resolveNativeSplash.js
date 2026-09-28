/* global Buffer, __dirname, __filename */
/**
 * Build-time native splash (the pre-JS frame).
 *
 * This file is plain CommonJS because Expo evaluates app.config.ts with
 * sucrase and does not transpile imported TypeScript. Merchant builds supply
 * a local file or a public https image. A missing or rejected asset resolves
 * to a neutral image so the Cartaisy wordmark is not baked into that frame.
 * The runtime JS splash is unchanged.
 */

const { spawnSync } = require("child_process");
const { createHash } = require("crypto");
const { closeSync, openSync, readSync } = require("fs");
const { mkdir, writeFile } = require("fs/promises");
const os = require("os");
const path = require("path");

const CARTAISY_SPLASH_IMAGE = "./assets/images/cartaisy-color-logo.png";
const NEUTRAL_SPLASH_IMAGE = "./assets/images/neutral-splash.png";

const CARTAISY_SLUG = "cartaisy";
const CARTAISY_IOS_BUNDLE = "com.rendernext.cartaisy";
const CARTAISY_ANDROID_PACKAGE = "com.rendernext.cartaisy";

const MAX_DOWNLOAD_BYTES = 4 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 8000;

const SHOPIFY_TOKEN_PREFIX = /shpat_|shpss_|shpca_|shppa_|shptka_/i;

const readEnv = (env, names) => {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
};

const isCartaisyDefaultIdentity = (env) => {
  const slug = readEnv(env, ["APP_SLUG"]) ?? CARTAISY_SLUG;
  const iosBundle =
    readEnv(env, ["IOS_BUNDLE_IDENTIFIER", "EXPO_PUBLIC_IOS_BUNDLE_ID"]) ??
    CARTAISY_IOS_BUNDLE;
  const androidPackage =
    readEnv(env, ["ANDROID_PACKAGE", "EXPO_PUBLIC_ANDROID_PACKAGE"]) ??
    CARTAISY_ANDROID_PACKAGE;

  return (
    slug === CARTAISY_SLUG &&
    iosBundle === CARTAISY_IOS_BUNDLE &&
    androidPackage === CARTAISY_ANDROID_PACKAGE
  );
};

const isPrivateOrLiteralHost = (hostname) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }

  // Branding URLs are public hostnames. IP literals are rejected so a build
  // cannot be pointed at a link-local or private address.
  if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return true;
  }

  return false;
};

const hasCredentialMaterial = (url) => {
  if (url.username || url.password) {
    return true;
  }

  const raw = `${url.pathname}${url.search}${url.hash}`;
  if (SHOPIFY_TOKEN_PREFIX.test(raw)) {
    return true;
  }

  for (const [key, value] of url.searchParams) {
    const name = key.toLowerCase();
    if (
      name === "token" ||
      name.endsWith("_token") ||
      name.endsWith("-token") ||
      name.includes("secret") ||
      name === "password" ||
      name === "api_key" ||
      name === "apikey" ||
      name === "api-key" ||
      name === "key" ||
      name === "signature" ||
      name === "sig" ||
      name === "x-shopify-access-token"
    ) {
      return true;
    }

    if (SHOPIFY_TOKEN_PREFIX.test(value)) {
      return true;
    }
  }

  return false;
};

/** Public https URL with no userinfo, token query, or private host. */
const isSafePublicSplashUrl = (raw) => {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") {
    return false;
  }

  if (isPrivateOrLiteralHost(url.hostname) || hasCredentialMaterial(url)) {
    return false;
  }

  return true;
};

const sniffImageKind = (bytes) => {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }

  return null;
};

const defaultIsImageFile = (filePath) => {
  let fd = null;
  try {
    fd = openSync(filePath, "r");
    const bytes = Buffer.alloc(16);
    const read = readSync(fd, bytes, 0, 16, 0);
    return sniffImageKind(bytes.subarray(0, read)) !== null;
  } catch {
    return false;
  } finally {
    if (fd !== null) {
      closeSync(fd);
    }
  }
};

const warn = (message) => {
  console.warn(`[native-splash] ${message}`);
};

const neutral = () => ({
  image: NEUTRAL_SPLASH_IMAGE,
  source: "neutral",
});

const toRepoRelative = (repoRoot, absolutePath) => {
  const relative = path.relative(repoRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return `./${relative.split(path.sep).join("/")}`;
};

const resolveLocalSplash = (splashPath, repoRoot, isImageFile) => {
  const absolute = path.isAbsolute(splashPath)
    ? splashPath
    : path.resolve(repoRoot, splashPath);

  if (!path.isAbsolute(splashPath)) {
    if (!toRepoRelative(repoRoot, absolute)) {
      return null;
    }
  }

  if (!isImageFile(absolute)) {
    return null;
  }

  if (path.isAbsolute(splashPath)) {
    return absolute;
  }

  return toRepoRelative(repoRoot, absolute);
};

const downloadPublicSplash = async (
  rawUrl,
  cacheDir = path.join(os.tmpdir(), "cartaisy-native-splash")
) => {
  if (!isSafePublicSplashUrl(rawUrl)) {
    throw new Error("Rejected splash URL.");
  }

  const hash = createHash("sha256").update(rawUrl).digest("hex");
  await mkdir(cacheDir, { recursive: true });

  for (const extension of ["png", "jpg"]) {
    const cached = path.join(cacheDir, `${hash}.${extension}`);
    if (defaultIsImageFile(cached)) {
      return cached;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(rawUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "image/png,image/jpeg" },
    });

    let finalUrl;
    try {
      finalUrl = new URL(response.url || rawUrl);
    } catch {
      throw new Error("Splash download returned an unreadable URL.");
    }

    if (
      finalUrl.protocol !== "https:" ||
      isPrivateOrLiteralHost(finalUrl.hostname) ||
      hasCredentialMaterial(finalUrl)
    ) {
      throw new Error("Splash download left the public https host.");
    }

    if (!response.ok) {
      throw new Error(`Splash download failed with HTTP ${response.status}.`);
    }

    const contentType = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (
      contentType &&
      contentType !== "image/png" &&
      contentType !== "image/jpeg" &&
      contentType !== "image/jpg" &&
      contentType !== "application/octet-stream"
    ) {
      throw new Error("Splash download was not a PNG or JPEG.");
    }

    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_DOWNLOAD_BYTES) {
      throw new Error("Splash download exceeded the size limit.");
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_DOWNLOAD_BYTES) {
      throw new Error("Splash download exceeded the size limit.");
    }

    const kind = sniffImageKind(bytes);
    if (!kind) {
      throw new Error("Splash download was not a PNG or JPEG.");
    }

    const extension = kind === "png" ? "png" : "jpg";
    const destination = path.join(cacheDir, `${hash}.${extension}`);
    await writeFile(destination, bytes);
    return destination;
  } finally {
    clearTimeout(timeout);
  }
};

const downloadPublicSplashSync = (rawUrl) => {
  const result = spawnSync(process.execPath, [__filename, "--download", rawUrl], {
    encoding: "utf8",
    timeout: DOWNLOAD_TIMEOUT_MS + 2000,
    maxBuffer: 1024 * 1024,
  });

  if (result.error || result.status !== 0) {
    const detail = (result.stderr || result.error?.message || "").trim();
    throw new Error(detail || "Splash download failed.");
  }

  const destination = (result.stdout || "").trim();
  if (!destination) {
    throw new Error("Splash download returned no file.");
  }

  return destination;
};

const resolveNativeSplash = ({
  env,
  repoRoot = path.resolve(__dirname, ".."),
  download = downloadPublicSplashSync,
  isImageFile = defaultIsImageFile,
}) => {
  const splashPath = readEnv(env, ["SPLASH_IMAGE_PATH"]);
  const splashUrl = readEnv(env, ["SPLASH_IMAGE_URL"]);

  if (splashPath) {
    const local = resolveLocalSplash(splashPath, repoRoot, isImageFile);
    if (local) {
      return { image: local, source: "local-file" };
    }

    warn(
      "SPLASH_IMAGE_PATH is missing or is not a PNG/JPEG. Using the neutral splash."
    );
    return neutral();
  }

  if (splashUrl) {
    if (!isSafePublicSplashUrl(splashUrl)) {
      warn(
        "SPLASH_IMAGE_URL must be a public https URL with no credentials. Using the neutral splash."
      );
      return neutral();
    }

    try {
      const downloaded = download(splashUrl);
      if (!isImageFile(downloaded)) {
        throw new Error("Downloaded splash is not a PNG or JPEG.");
      }
      return { image: downloaded, source: "downloaded-url" };
    } catch {
      let host = "the branding host";
      try {
        host = new URL(splashUrl).host;
      } catch {
        host = "the branding host";
      }
      warn(
        `Could not download the native splash from ${host}. Using the neutral splash.`
      );
      return neutral();
    }
  }

  if (!isCartaisyDefaultIdentity(env)) {
    warn(
      "Merchant build has no native splash asset. Using the neutral splash."
    );
    return neutral();
  }

  const cartaisyAbsolute = path.resolve(repoRoot, CARTAISY_SPLASH_IMAGE);
  if (isImageFile(cartaisyAbsolute)) {
    return { image: CARTAISY_SPLASH_IMAGE, source: "cartaisy-default" };
  }

  warn("Cartaisy default splash asset is missing. Using the neutral splash.");
  return neutral();
};

const resolveNativeSplashImage = (env = process.env) =>
  resolveNativeSplash({ env }).image;

if (require.main === module && process.argv[2] === "--download") {
  const url = process.argv[3];
  downloadPublicSplash(url)
    .then((destination) => {
      process.stdout.write(destination);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Splash download failed.";
      process.stderr.write(message);
      process.exitCode = 1;
    });
}

module.exports = {
  CARTAISY_SPLASH_IMAGE,
  NEUTRAL_SPLASH_IMAGE,
  downloadPublicSplash,
  isCartaisyDefaultIdentity,
  isSafePublicSplashUrl,
  resolveNativeSplash,
  resolveNativeSplashImage,
  sniffImageKind,
};
