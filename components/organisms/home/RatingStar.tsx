import { AppImage } from "@/components/atoms/AppImage";
import { XStack } from "tamagui";

export const RatingStar = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<AppImage name="star" width={16} height={16} />);
  }

  if (hasHalfStar) {
    stars.push(<AppImage name="starHalf" width={16} height={16} />);
  }

  return <XStack gap={"$xxs"}>{stars}</XStack>;
};
