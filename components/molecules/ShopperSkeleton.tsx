import React from "react";
import { useWindowDimensions } from "react-native";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import { XStack, YStack } from "tamagui";

type ShopperSkeletonProps = {
  variant: "catalog" | "detail" | "account" | "results";
};

const Bone = ({
  width,
  height,
  radius = 16,
}: {
  width: number | `${number}%`;
  height: number;
  radius?: number;
}) => (
  <YStack
    backgroundColor="$grey"
    width={width}
    height={height}
    borderRadius={radius}
    overflow="hidden"
  >
    <Shimmer easing={Easing.linear} speed={0.55} />
  </YStack>
);

/**
 * Calm loading placeholders sized like the loaded shopper layout:
 * a large image block, then type, then actions. Neutral grey so a
 * merchant color does not strobe while data is still arriving.
 */
export const ShopperSkeleton = ({ variant }: ShopperSkeletonProps) => {
  const { width } = useWindowDimensions();
  const pad = 16;
  const gap = 12;
  const contentWidth = Math.max(width - pad * 2, 280);

  return (
    <ShimmerProvider duration={1200}>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal={pad}
        paddingTop="$lg"
        testID={`shopper-skeleton-${variant}`}
      >
        {variant === "catalog" ? (
          <CatalogBones width={contentWidth} gap={gap} />
        ) : null}
        {variant === "detail" ? <DetailBones width={contentWidth} /> : null}
        {variant === "account" ? <AccountBones width={contentWidth} /> : null}
        {variant === "results" ? <ResultsBones width={contentWidth} /> : null}
      </YStack>
    </ShimmerProvider>
  );
};

const CatalogBones = ({ width, gap }: { width: number; gap: number }) => {
  const cardWidth = (width - gap) / 2;
  const imageHeight = Math.round(cardWidth * 1.15);

  return (
    <YStack gap="$md">
      <Bone width={width} height={188} radius={20} />
      <Bone width="42%" height={14} radius={8} />
      <Bone width="68%" height={14} radius={8} />
      <XStack gap={gap} flexWrap="wrap">
        {[0, 1, 2, 3].map((index) => (
          <YStack key={index} width={cardWidth} gap="$sm" marginBottom="$sm">
            <Bone width={cardWidth} height={imageHeight} radius={18} />
            <Bone width="78%" height={12} radius={8} />
            <Bone width="40%" height={12} radius={8} />
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
};

const DetailBones = ({ width }: { width: number }) => (
  <YStack gap="$md">
    <Bone width={width} height={Math.min(Math.round(width * 1.05), 420)} radius={0} />
    <Bone width="70%" height={18} radius={8} />
    <Bone width="36%" height={16} radius={8} />
    <Bone width="100%" height={12} radius={8} />
    <Bone width="88%" height={12} radius={8} />
    <YStack gap="$sm" marginTop="$md">
      <Bone width="100%" height={48} radius={14} />
      <Bone width="100%" height={48} radius={14} />
    </YStack>
  </YStack>
);

const AccountBones = ({ width }: { width: number }) => (
  <YStack gap="$md" alignItems="center" paddingTop="$xl">
    <Bone width={72} height={72} radius={36} />
    <Bone width={160} height={16} radius={8} />
    <Bone width={110} height={12} radius={8} />
    <YStack width={width} gap="$sm" marginTop="$lg">
      <Bone width="100%" height={72} radius={16} />
      <Bone width="100%" height={72} radius={16} />
      <Bone width="100%" height={72} radius={16} />
    </YStack>
  </YStack>
);

const ResultsBones = ({ width }: { width: number }) => (
  <YStack gap="$md" paddingTop="$sm">
    {[0, 1, 2, 3, 4].map((index) => (
      <XStack key={index} gap="$md" alignItems="center">
        <Bone width={72} height={72} radius={14} />
        <YStack flex={1} gap="$sm" maxWidth={width - 88}>
          <Bone width="80%" height={12} radius={8} />
          <Bone width="46%" height={12} radius={8} />
        </YStack>
      </XStack>
    ))}
  </YStack>
);
