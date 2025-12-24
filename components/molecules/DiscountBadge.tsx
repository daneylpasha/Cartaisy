import React from 'react';
import { YStack } from 'tamagui';
import { TextXSBold } from '@/components/atoms/texts/TextXSBold';
import { TextXSRegular } from '@/components/atoms/texts/TextXSRegular';
import { formatPrice } from '@/utils/formatPrice';

interface DiscountBadgeProps {
  price: number;
  compareAtPrice?: number;
  currency?: string; // ISO 4217 currency code (USD, GBP, EUR, etc.)
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  price,
  compareAtPrice,
  currency = 'USD',
}) => {
  // Only show if there's a discount
  if (!compareAtPrice || compareAtPrice <= price) {
    return null;
  }

  // Calculate discount percentage
  const discountPercentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);

  return (
    <YStack
      backgroundColor="#FF6B6B"
      paddingHorizontal="$xs"
      paddingVertical={4}
      borderRadius="$xs"
    >
      <TextXSBold color="$white">
        -{discountPercentage}%
      </TextXSBold>
    </YStack>
  );
};

/**
 * Component to display both original and discounted price
 */
interface PriceWithDiscountProps {
  price: number;
  compareAtPrice?: number;
  currency?: string; // ISO 4217 currency code (USD, GBP, EUR, etc.)
}

export const PriceWithDiscount: React.FC<PriceWithDiscountProps> = ({
  price,
  compareAtPrice,
  currency = 'USD',
}) => {
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <YStack gap="$xs-sm">
      <TextXSBold color="$darkgrey" fontSize={18}>
        {formatPrice(price, currency)}
      </TextXSBold>

      {hasDiscount && (
        <TextXSRegular
          color="$secondary"
          fontSize={14}
          textDecorationLine="line-through"
        >
          {formatPrice(compareAtPrice, currency)}
        </TextXSRegular>
      )}
    </YStack>
  );
};
