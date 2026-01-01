import React, { useRef, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useIsFavorite } from '@/api/hooks/useFavorites';
import { AppImage } from '@/components/atoms/AppImage';
import { Loader } from '@/components/atoms/Loader';

interface FavoriteButtonProps {
  productId: string;
  onToggle: (productId: string) => void;
  size?: number;
  isLoading?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  onToggle,
  size = 24,
  isLoading = false,
}) => {
  const isFavorite = useIsFavorite(productId);

  // Debounce to prevent double tap
  const lastPressTime = useRef(0);
  const DEBOUNCE_DELAY = 400;

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressTime.current < DEBOUNCE_DELAY) {
      return;
    }
    lastPressTime.current = now;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(productId);
  }, [productId, onToggle]);

  return (
    <TouchableOpacity onPress={handlePress} disabled={isLoading}>
      <YStack
        width={size + 16}
        height={size + 16}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$white"
        borderRadius="$full"
        opacity={isLoading ? 0.6 : 1}
      >
        {isLoading ? (
          <Loader size="small" color="#FF6B6B" />
        ) : (
          <AppImage
            name={isFavorite ? 'heartFilled' : 'heart'}
            width={size}
            height={size}
            tintColor={isFavorite ? '#FF6B6B' : '#6B7280'}
          />
        )}
      </YStack>
    </TouchableOpacity>
  );
};
