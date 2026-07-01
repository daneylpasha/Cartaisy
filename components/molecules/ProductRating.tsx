import React from 'react';
import { XStack, YStack } from 'tamagui';
import { AppImage } from '@/components/atoms/AppImage';
import { TextXSRegular } from '@/components/atoms/texts/TextXSRegular';

interface ProductRatingProps {
  rating: number;
  reviewsCount: number;
  size?: 'small' | 'medium' | 'large';
  showReviewCount?: boolean;
}

export const ProductRating: React.FC<ProductRatingProps> = ({
  rating,
  reviewsCount,
  size = 'medium',
  showReviewCount = true,
}) => {
  const starSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;
  const maxStars = 5;

  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <XStack alignItems="center" gap="$xs">
      <XStack gap={2}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <AppImage
            key={`full-${index}`}
            name="star"
            width={starSize}
            height={starSize}
            tintColor="#FDB022"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <AppImage
            name="starHalf"
            width={starSize}
            height={starSize}
            tintColor="#FDB022"
          />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <AppImage
            key={`empty-${index}`}
            name="star"
            width={starSize}
            height={starSize}
            tintColor="#D1D5DB"
          />
        ))}
      </XStack>

      {showReviewCount ? (
        <TextXSRegular color="$secondary">
          ({rating.toFixed(1)}) {reviewsCount > 0 ? `• ${reviewsCount} reviews` : null}
        </TextXSRegular>
      ) : null}
    </XStack>
  );
};
