export const CARTAISY_ICON_IMAGE: string;
export const NEUTRAL_ICON_IMAGE: string;
export const CARTAISY_ADAPTIVE_ICON: string;

export type NativeIconSource =
  | "local-file"
  | "downloaded-url"
  | "cartaisy-default"
  | "neutral";

export type NativeIconResolution = {
  image: string;
  source: NativeIconSource;
};

export type IconEnv = Record<string, string | undefined>;

export type ResolveNativeIconOptions = {
  env: IconEnv;
  repoRoot?: string;
  download?: (url: string) => string;
  isImageFile?: (filePath: string) => boolean;
};

export type ResolveAdaptiveIconOptions = {
  env: IconEnv;
  repoRoot?: string;
  launcherImage: string;
  isImageFile?: (filePath: string) => boolean;
};

export type NativeIconAssets = {
  icon: string;
  adaptiveForeground: string;
};

export function isSafePublicIconUrl(raw: string): boolean;

export function downloadPublicIcon(
  rawUrl: string,
  cacheDir?: string
): Promise<string>;

export function resolveNativeIcon(
  options: ResolveNativeIconOptions
): NativeIconResolution;

export function resolveNativeIconImage(env?: IconEnv): string;

export function resolveAdaptiveIconForeground(
  options: ResolveAdaptiveIconOptions
): string;

export function resolveNativeIconAssets(env?: IconEnv): NativeIconAssets;
