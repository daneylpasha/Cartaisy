/* global Buffer, __dirname, __filename */
/**
 * Build-time native launcher icon (iOS App Icon and the Android icon).
 *
 * This file is plain CommonJS because Expo evaluates app.config.ts with
 * sucrase and does not transpile imported TypeScript. The resolution order
 * and the public-https rules match scripts/resolveNativeSplash.js. Merchant
 * builds supply a local file or a public https image. A missing or rejected
 * asset resolves to a neutral image so the Cartaisy wordmark is not baked
 * into the launcher. The runtime JS icon is unchanged.
 *
 * Identity checks and image sniffing are reused from the splash resolver so
 * those rules stay one implementation. Splash resolution itself is unchanged.
 */

const { spawnSync } = require("child_process");
const { createHash } = require("crypto");
const { closeSync, openSync, readSync } = require("fs");
const { mkdir, writeFile } = require("fs/promises");
const os = require("os");
const path = require("path");
const {
  isCartaisyDefaultIdentity,
  sniffImageKind,
} = require("./resolveNativeSplash");

const CARTAISY_ICON_IMAGE = "./assets/images/icon.png";
const NEUTRAL_ICON_IMAGE = "./assets/images/neutral-icon.png";
const CARTAISY_ADAPTIVE_ICON = "./assets/images/adaptive-icon.png";

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
const isSafePublicIconUrl = (raw) => {
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
  console.warn(`[native-icon] ${message}`);
};

const neutral = () => ({
  image: NEUTRAL_ICON_IMAGE,
  source: "neutral",
});

const toRepoRelative = (repoRoot, absolutePath) => {
  const relative = path.relative(repoRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return `./${relative.split(path.sep).join("/")}`;
};

const resolveLocalIcon = (iconPath, repoRoot, isImageFile) => {
  const absolute = path.isAbsolute(iconPath)
    ? iconPath
    : path.resolve(repoRoot, iconPath);

  if (!path.isAbsolute(iconPath)) {
    if (!toRepoRelative(repoRoot, absolute)) {
      return null;
    }
  }

  if (!isImageFile(absolute)) {
    return null;
  }

  if (path.isAbsolute(iconPath)) {
    return absolute;
  }

  return toRepoRelative(repoRoot, absolute);
};

const downloadPublicIcon = async (
  rawUrl,
  cacheDir = path.join(os.tmpdir(), "cartaisy-native-icon")
) => {
  if (!isSafePublicIconUrl(rawUrl)) {
    throw new Error("Rejected icon URL.");
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
      throw new Error("Icon download returned an unreadable URL.");
    }

    if (
      finalUrl.protocol !== "https:" ||
      isPrivateOrLiteralHost(finalUrl.hostname) ||
      hasCredentialMaterial(finalUrl)
    ) {
      throw new Error("Icon download left the public https host.");
    }

    if (!response.ok) {
      throw new Error(`Icon download failed with HTTP ${response.status}.`);
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
      throw new Error("Icon download was not a PNG or JPEG.");
    }

    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_DOWNLOAD_BYTES) {
      throw new Error("Icon download exceeded the size limit.");
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_DOWNLOAD_BYTES) {
      throw new Error("Icon download exceeded the size limit.");
    }

    const kind = sniffImageKind(bytes);
    if (!kind) {
      throw new Error("Icon download was not a PNG or JPEG.");
    }

    const extension = kind === "png" ? "png" : "jpg";
    const destination = path.join(cacheDir, `${hash}.${extension}`);
    await writeFile(destination, bytes);
    return destination;
  } finally {
    clearTimeout(timeout);
  }
};

const downloadPublicIconSync = (rawUrl) => {
  const result = spawnSync(process.execPath, [__filename, "--download", rawUrl], {
    encoding: "utf8",
    timeout: DOWNLOAD_TIMEOUT_MS + 2000,
    maxBuffer: 1024 * 1024,
  });

  if (result.error || result.status !== 0) {
    const detail = (result.stderr || result.error?.message || "").trim();
    throw new Error(detail || "Icon download failed.");
  }

  const destination = (result.stdout || "").trim();
  if (!destination) {
    throw new Error("Icon download returned no file.");
  }

  return destination;
};

const resolveNativeIcon = ({
  env,
  repoRoot = path.resolve(__dirname, ".."),
  download = downloadPublicIconSync,
  isImageFile = defaultIsImageFile,
}) => {
  // ICON_IMAGE_* only. EXPO_PUBLIC_ICON_IMAGE_* would be bundled into JS.
  const iconPath = readEnv(env, ["ICON_IMAGE_PATH"]);
  const iconUrl = readEnv(env, ["ICON_IMAGE_URL"]);

  if (iconPath) {
    const local = resolveLocalIcon(iconPath, repoRoot, isImageFile);
    if (local) {
      return { image: local, source: "local-file" };
    }

    warn(
      "ICON_IMAGE_PATH is missing or is not a PNG/JPEG. Using the neutral icon."
    );
    return neutral();
  }

  if (iconUrl) {
    if (!isSafePublicIconUrl(iconUrl)) {
      warn(
        "ICON_IMAGE_URL must be a public https URL with no credentials. Using the neutral icon."
      );
      return neutral();
    }

    try {
      const downloaded = download(iconUrl);
      if (!isImageFile(downloaded)) {
        throw new Error("Downloaded icon is not a PNG or JPEG.");
      }
      return { image: downloaded, source: "downloaded-url" };
    } catch {
      let host = "the branding host";
      try {
        host = new URL(iconUrl).host;
      } catch {
        host = "the branding host";
      }
      warn(
        `Could not download the native icon from ${host}. Using the neutral icon.`
      );
      return neutral();
    }
  }

  if (!isCartaisyDefaultIdentity(env)) {
    warn(
      "Merchant build has no native icon asset. Using the neutral icon."
    );
    return neutral();
  }

  const cartaisyAbsolute = path.resolve(repoRoot, CARTAISY_ICON_IMAGE);
  if (isImageFile(cartaisyAbsolute)) {
    return { image: CARTAISY_ICON_IMAGE, source: "cartaisy-default" };
  }

  warn("Cartaisy default icon asset is missing. Using the neutral icon.");
  return neutral();
};

const isDefaultCartaisyAdaptive = (resolvedPath) => {
  const normalized = resolvedPath.split(path.sep).join("/");
  return (
    normalized === CARTAISY_ADAPTIVE_ICON ||
    normalized.endsWith("/assets/images/adaptive-icon.png")
  );
};

/**
 * Android's launcher icon is the adaptive foreground. A merchant build keeps
 * an explicit merchant file. The Cartaisy adaptive wordmark is used only for
 * the default Cartaisy identity.
 */
const resolveAdaptiveIconForeground = ({
  env,
  repoRoot = path.resolve(__dirname, ".."),
  launcherImage,
  isImageFile = defaultIsImageFile,
}) => {
  const explicit = readEnv(env, ["ANDROID_ADAPTIVE_ICON_PATH"]);
  if (explicit) {
    const local = resolveLocalIcon(explicit, repoRoot, isImageFile);
    if (
      local &&
      (!isDefaultCartaisyAdaptive(local) || isCartaisyDefaultIdentity(env))
    ) {
      return local;
    }
  }

  if (isCartaisyDefaultIdentity(env)) {
    const absolute = path.resolve(repoRoot, CARTAISY_ADAPTIVE_ICON);
    if (isImageFile(absolute)) {
      return CARTAISY_ADAPTIVE_ICON;
    }
  }

  return launcherImage;
};

const resolveNativeIconImage = (env = process.env) =>
  resolveNativeIcon({ env }).image;

const resolveNativeIconAssets = (env = process.env) => {
  const resolved = resolveNativeIcon({ env });
  return {
    icon: resolved.image,
    adaptiveForeground: resolveAdaptiveIconForeground({
      env,
      launcherImage: resolved.image,
    }),
  };
};

if (require.main === module && process.argv[2] === "--download") {
  const url = process.argv[3];
  downloadPublicIcon(url)
    .then((destination) => {
      process.stdout.write(destination);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Icon download failed.";
      process.stderr.write(message);
      process.exitCode = 1;
    });
}

module.exports = {
  CARTAISY_ADAPTIVE_ICON,
  CARTAISY_ICON_IMAGE,
  NEUTRAL_ICON_IMAGE,
  downloadPublicIcon,
  isSafePublicIconUrl,
  resolveAdaptiveIconForeground,
  resolveNativeIcon,
  resolveNativeIconAssets,
  resolveNativeIconImage,
};
