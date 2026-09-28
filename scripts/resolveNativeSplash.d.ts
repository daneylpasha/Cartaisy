export const CARTAISY_SPLASH_IMAGE: string;
export const NEUTRAL_SPLASH_IMAGE: string;

export type NativeSplashSource =
  | "local-file"
  | "downloaded-url"
  | "cartaisy-default"
  | "neutral";

export type NativeSplashResolution = {
  image: string;
  source: NativeSplashSource;
};

export type SplashEnv = Record<string, string | undefined>;

export type ResolveNativeSplashOptions = {
  env: SplashEnv;
  repoRoot?: string;
  download?: (url: string) => string;
  isImageFile?: (filePath: string) => boolean;
};

export function isCartaisyDefaultIdentity(env: SplashEnv): boolean;

export function isSafePublicSplashUrl(raw: string): boolean;

export function sniffImageKind(bytes: Buffer): "png" | "jpeg" | null;

export function downloadPublicSplash(
  rawUrl: string,
  cacheDir?: string
): Promise<string>;

export function resolveNativeSplash(
  options: ResolveNativeSplashOptions
): NativeSplashResolution;

export function resolveNativeSplashImage(env?: SplashEnv): string;
