import { HeadingSMBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphMD } from "@/components/atoms/texts/ParagraphMD";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, ListRenderItem, StyleSheet } from "react-native";
import { XStack, YStack } from "tamagui";

export interface Slide {
  id: number;
  title: string;
  description: string;
  image: any;
}

export const slidesData: Slide[] = [
  {
    id: 1,
    title: "Your Personalized Shopping Experience",
    description:
      "With your permission, we can help you shop in a completely new experience.",
    image: "onboardingFrame1",
  },
  {
    id: 2,
    title: "Carti AI Shopping Assistant Is Here.",
    description:
      "Your personal shopping guide to find products faster and shop smarter!",
    image: "onboardingFrame2",
  },
  {
    id: 3,
    title: "Find Products You Love, And Buy It For Life",
    description:
      "Discover quality items made to last, perfectly suited to your style.",
    image: "onboardingFrame3",
  },
  {
    id: 4,
    title: "Create Your Customizable Wishlist",
    description:
      "Save and organize your favorite finds for easy access anytime.",
    image: "onboardingFrame4",
  },
  {
    id: 5,
    title: " Open Your Own Store Or Explore Millions",
    description:
      " Start selling in minutes or browse endless unique products from top sellers.",
    image: "onboardingFrame5",
  },
  {
    id: 6,
    title: "Manage Payments & Track Delivery Order",
    description:
      "Keep tabs on payments and stay updated with real-time delivery tracking.",
    image: "onboardingFrame6",
  },
  {
    id: 7,
    title: "Get The Latest Deals. Save More, Spend Less",
    description:
      "Access exclusive offers and maximize your savings every time you shop!",
    image: "onboardingFrame7",
  },
];

const onboardingSlides: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const onPressNextSlide = () => {
    if (activeIndex === slidesData.length - 1) {
      router.push("/wellcome");
    } else {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const onPressPrevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  };

  const currentSlide: Slide = slidesData[activeIndex];

  const renderProgressBar: ListRenderItem<number> = ({ index }) => {
    return (
      <YStack
        key={index}
        width={53}
        height={4}
        backgroundColor={activeIndex === index ? "$primary" : "$grey"}
      />
    );
  };

  return (
    <ScreenContainer backgroundColor={"background"}>
      {/* Top Progress Lines */}
      <Spacer size={"$reg"} />

      <XStack justifyContent="center">
        <FlatList
          data={Array.from({ length: slidesData.length }, (_, i) => i)}
          renderItem={renderProgressBar}
          keyExtractor={(item) => item.toString()}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={Styles.container}
        />
      </XStack>
      <Spacer size={"$reg"} />
      <Spacer size={"$2xl"} />
      {/* Center Image */}
      <YStack>
        <AppImage name={currentSlide.image} height={330} />
      </YStack>
      <Spacer size={"$lg"} />
      <Spacer size={"$xl"} />
      {/* Bottom Content */}
      <YStack paddingHorizontal={"$md"}>
        <HeadingSMBold textAlign="center">{currentSlide.title}</HeadingSMBold>
        <Spacer size={"$md"} />
        <ParagraphMD color="$secondary" textAlign="center">
          {currentSlide.description}
        </ParagraphMD>
      </YStack>
      {/* Navigation Buttons */}
      <Spacer size={"$xl"} />
      <XStack justifyContent="center" alignItems="center">
        <OpTouch
          disabled={activeIndex === 0}
          backgroundColor="primary"
          height={64}
          style={{ opacity: activeIndex === 0 ? 0.2 : 1 }}
          alignItems="center"
          justifyContent="center"
          width={64}
          borderRadius="full"
          onPress={onPressPrevSlide}
        >
          <AppImage name="leftSlide" width={13.1} height={23.1} />
        </OpTouch>
        <Spacer size={"$md"} />
        <OpTouch
          backgroundColor="primary"
          height={64}
          alignItems="center"
          justifyContent="center"
          width={64}
          borderRadius="full"
          onPress={onPressNextSlide}
        >
          <AppImage name="rightSlide" width={13.1} height={23.1} />
        </OpTouch>
      </XStack>
    </ScreenContainer>
  );
};

export default onboardingSlides;

const Styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
});
