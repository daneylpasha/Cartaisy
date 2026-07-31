import Icons from "@/assets/Icons";
import type { AppConfig } from "@/tamagui/config";
import { tokens } from "@/tamagui/token";
import React, { useState } from "react";
import { Image, ImageResizeMode } from "react-native";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import type { SvgProps } from "react-native-svg";
import { styled, YStack } from "tamagui";

type AppImageProps = {
  name?: keyof typeof Icons;
  source?: string | { uri: string };
  // Bundled icon to render when a remote `source` fails to load. Only
  // takes effect on the remote-image path — call sites that don't pass
  // this keep today's behavior of rendering nothing on a failed remote
  // load.
  fallbackName?: keyof typeof Icons;
  size?: number;
  width?: number | string;
  radius?: keyof AppConfig["tokens"]["space"] | number;
  height?: number;
  style?: any;
  tintColor?: keyof AppConfig["tokens"]["color"] | string;
  resizeMode?: ImageResizeMode;
};

// Styled wrapper using Tamagui
const StyledImage = styled(Image, {
  resizeMode: "contain",
});

const resolveTokenColor = (
  value?: keyof typeof tokens.color | string
): string | undefined => {
  if (!value) return undefined;

  if (
    typeof value === "string" &&
    value in tokens.color &&
    typeof tokens.color[value as keyof typeof tokens.color] === "string"
  ) {
    return tokens.color[value as keyof typeof tokens.color] as string;
  }

  if (
    typeof value === "string" &&
    value.startsWith("$") &&
    value.length > 1
  ) {
    const key = value.slice(1);
    if (
      key in tokens.color &&
      typeof tokens.color[key as keyof typeof tokens.color] === "string"
    ) {
      return tokens.color[key as keyof typeof tokens.color] as string;
    }
  }

  return typeof value === "string" ? value : undefined;
};

// Resolves a bundled icon key from assets/Icons.ts into either an SVG
// component or a local image source. Shared by the `name` prop path and
// the remote-image fallback path (see BundledIcon below) so both render
// bundled icons through the exact same SVG/Image branching instead of
// duplicating it.
type ResolvedIcon =
  | { kind: "svg"; Component: React.FC<SvgProps> }
  | { kind: "image"; source: number | { uri: string } }
  | undefined;

const resolveNamedIcon = (name: keyof typeof Icons): ResolvedIcon => {
  const iconSource = Icons[name];

  if (typeof iconSource === "function") {
    return { kind: "svg", Component: iconSource as React.FC<SvgProps> };
  }

  if (
    iconSource &&
    (typeof iconSource === "number" ||
      (typeof iconSource === "object" && iconSource.uri))
  ) {
    return { kind: "image", source: iconSource as number | { uri: string } };
  }

  return undefined;
};

type BundledIconProps = {
  iconName: keyof typeof Icons;
  width?: number | string;
  height?: number;
  style?: any;
  tintColor?: string;
  resizeMode: ImageResizeMode;
  radius?: keyof AppConfig["tokens"]["space"] | number;
};

const BundledIcon: React.FC<BundledIconProps> = ({
  iconName,
  width,
  height,
  style,
  tintColor,
  resizeMode,
  radius,
}) => {
  const resolved = resolveNamedIcon(iconName);

  if (!resolved) {
    return null;
  }

  if (resolved.kind === "svg") {
    const SvgComponent = resolved.Component;
    return (
      <SvgComponent
        width={width}
        height={height}
        style={style}
        fill={tintColor}
        color={tintColor}
      />
    );
  }

  return (
    <StyledImage
      source={resolved.source}
      style={[
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
      tintColor={tintColor}
      resizeMode={resizeMode}
    />
  );
};

export const AppImage: React.FC<AppImageProps> = ({
  name,
  source,
  fallbackName,
  size,
  width,
  radius,
  height,
  style,
  tintColor,
  resizeMode = "contain",
}) => {
  // Determine if source is remote
  const isRemoteSource =
    (typeof source === "string" && source.trim()) ||
    (typeof source === "object" && source?.uri);

  const sourceKey = typeof source === "string" ? source : source?.uri || "";

  const [isLoading, setIsLoading] = useState(!!isRemoteSource);
  const [hasError, setHasError] = useState(false);

  // Reset loading state when source changes
  React.useEffect(() => {
    if (sourceKey && isRemoteSource) {
      setIsLoading(true);
      setHasError(false);

      // Fallback: Hide shimmer after 5 seconds even if onLoadEnd doesn't fire
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [sourceKey, isRemoteSource]);

  // Debug: Log loading state changes
  React.useEffect(() => {}, [isLoading, sourceKey]);

  const finalWidth = size || width;
  const finalHeight = size || height;

  const finalTintColor = resolveTokenColor(tintColor);

  // Bundled icon by name — render directly via the shared helper.
  if (name) {
    return (
      <BundledIcon
        iconName={name}
        width={finalWidth}
        height={finalHeight}
        style={style}
        tintColor={finalTintColor}
        resizeMode={resizeMode}
        radius={radius}
      />
    );
  }

  let finalSource;
  let isRemoteImage = false;

  if (source) {
    if (typeof source === "string") {
      // Only create URI object if string is not empty
      finalSource = source.trim() ? { uri: source } : undefined;
      isRemoteImage = !!finalSource;
    } else {
      finalSource = source?.uri ? source : undefined;
      isRemoteImage = !!finalSource;
    }
  }

  if (!finalSource) {
    console.log("❌ [AppImage] No finalSource, returning null");
    return null;
  }

  // Render regular image with shimmer placeholder for remote images
  if (isRemoteImage) {
    // A remote image that failed to load: fall back to a bundled icon if
    // the caller opted in via `fallbackName`, instead of continuing to
    // render the now-broken remote <Image> (native `Image` renders
    // blank/nothing on a failed load, not any kind of fallback). Call
    // sites that don't pass `fallbackName` keep today's exact behavior.
    if (hasError && fallbackName) {
      return (
        <BundledIcon
          iconName={fallbackName}
          width={finalWidth}
          height={finalHeight}
          style={style}
          tintColor={finalTintColor}
          resizeMode={resizeMode}
          radius={radius}
        />
      );
    }

    return (
      <YStack
        width={finalWidth as any}
        height={finalHeight}
        position="relative"
      >
        {/* Shimmer Placeholder - Only visible while loading */}
        {isLoading ? (
          <ShimmerProvider key={`shimmer-${sourceKey}`} duration={1000}>
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              width={finalWidth as any}
              height={finalHeight}
              backgroundColor="$grey"
              overflow="hidden"
              zIndex={10}
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
          </ShimmerProvider>
        ) : null}

        {/* Actual Image */}
        <StyledImage
          key={sourceKey}
          source={finalSource}
          style={[
            {
              width: finalWidth,
              height: finalHeight,
              borderRadius: radius,
            },
            style,
          ]}
          tintColor={finalTintColor}
          resizeMode={resizeMode}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </YStack>
    );
  }

  // isRemoteImage is only ever false here if finalSource is falsy, which
  // already returned null above — this is unreachable, kept only so the
  // function has an explicit exhaustive return for TypeScript.
  return null;
};
