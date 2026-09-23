import Icons from "@/assets/Icons";
import { TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { tokens } from "@/tamagui/token";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { getTokenValue, Stack, XStack, YStack } from "tamagui";

type Props = {
  images: (keyof typeof Icons)[] | keyof typeof Icons | string[] | string;
  height?: number;
  borderRadius?: number;
  showCounter?: boolean;
  dotSize?: number;
  dotColor?: string;
  activeDotColor?: string;
  onImagePress?: (index: number) => void;
  isFavorited?: boolean;
  onFavoritePress?: () => void;
  scaleAnim?: Animated.Value;
  blinkAnim?: Animated.Value;
};

export default function ProductCarousel({
  images,
  height,
  borderRadius = 0,
  showCounter = true,
  dotSize = 8,
  dotColor = "#D1D5DB",
  activeDotColor,
  onImagePress,
  isFavorited = false,
  onFavoritePress,
  scaleAnim,
  blinkAnim,
}: Props) {
  const { width } = useWindowDimensions();
  const h = height ?? width;
  const getReactiveColor = useReactiveTokenColor();
  const resolvedActiveDotColor =
    activeDotColor ?? getReactiveColor("primary") ?? tokens.color.primary;
  const activeDotScale = useRef(new Animated.Value(1)).current;
  const hasPaged = useRef(false);

  // ✅ always array - handle both icon names and URLs
  const data: string[] = Array.isArray(images)
    ? images.map((img) => String(img))
    : [String(images)];
  const total = data.length;

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (!hasPaged.current) {
      hasPaged.current = true;
      return;
    }
    activeDotScale.setValue(0.72);
    Animated.spring(activeDotScale, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [index, activeDotScale]);

  const onEnd = (e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const goTo = (i: number) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
  };

  const getItemLayout = (_: any, i: number) => ({
    length: width,
    offset: width * i,
    index: i,
  });

  // ✅ FIXED: Handle image press with proper logging
  const handleImagePress = (index: number) => {
    onImagePress?.(index);
  };

  return (
    <YStack width={width}>
    <YStack style={{ width, height: h, borderRadius, overflow: "hidden" }}>
      {showCounter && (
        <XStack
          position="absolute"
          top={20}
          left={10}
          zIndex={2}
          backgroundColor="rgba(17, 17, 17, 0.55)"
          paddingHorizontal={"$reg"}
          paddingVertical={"$xs"}
          borderRadius={"$full"}
        >
          <TextSMMedium color="$white">
            {total ? `${index + 1}/${total}` : "0/0"}
          </TextSMMedium>
        </XStack>
      )}

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item, i) => `${item}-${i}`}
        renderItem={({ item, index: i }) => (
          <YStack
            alignItems="center"
            justifyContent="center"
            width={width}
            height={h}
          >
            {/* Image touch area - positioned first so it gets touch events */}
            <OpTouch
              onPress={() => handleImagePress(i)}
              style={{
                width,
                height: h,
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            >
              <Stack pointerEvents="none" style={{ width, height: h }}>
                {/* Check if it's a URL or icon name */}
                {item &&
                (item.startsWith("http") || item.startsWith("https")) ? (
                  <AppImage
                    resizeMode="cover"
                    source={item}
                    width={width}
                    height={h}
                  />
                ) : item && Icons[item as keyof typeof Icons] ? (
                  <AppImage
                    name={item as keyof typeof Icons}
                    width={width}
                    height={h}
                    resizeMode="cover"
                  />
                ) : null}
              </Stack>
            </OpTouch>

            {/* Overlay buttons - positioned above image but with pointerEvents="box-none" */}
            <XStack style={styles.blurviewcontainer} pointerEvents="box-none">
              {/* <OpTouch
                style={{ zIndex: 100 }}
                onPress={() => {
                  // Handle share button press
                }}
              >
                <BlurView intensity={45} tint="dark" style={styles.blurView}>
                  <AppImage
                    name="share"
                    tintColor="$black"
                    width={21}
                    height={18}
                  />
                </BlurView>
              </OpTouch> */}
              <Spacer size={"$reg"} />
              <OpTouch
                style={{ zIndex: 100 }}
                onPress={onFavoritePress}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <BlurView intensity={45} tint="dark" style={styles.blurView}>
                  <Animated.View
                    style={{
                      transform: scaleAnim ? [{ scale: scaleAnim }] : [],
                      opacity: blinkAnim || 1,
                      width: 21,
                      height: 21,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AppImage
                      name={isFavorited ? "wishlistIcon" : "heart"}
                      tintColor={
                        isFavorited
                          ? getTokenValue("$error")
                          : getTokenValue("$white")
                      }
                      width={isFavorited ? 22 : 20}
                      height={isFavorited ? 22 : 20}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </BlurView>
              </OpTouch>
            </XStack>
          </YStack>
        )}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        getItemLayout={getItemLayout}
      />
    </YStack>

      <Spacer size={"$md"} />

      <XStack alignItems="center" justifyContent="center">
        {data.map((item, i) => (
          <OpTouch
            key={`dot-${item}-${i}`}
            onPress={() => goTo(i)}
            style={{ paddingHorizontal: 4 }}
          >
            <Animated.View
              testID={i === index ? "product-carousel-active-dot" : undefined}
              style={{
                width: i === index ? dotSize * 2.25 : dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor:
                  i === index ? resolvedActiveDotColor : dotColor,
                transform: i === index ? [{ scale: activeDotScale }] : undefined,
              }}
            />
          </OpTouch>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  blurviewcontainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  blurView: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 100,
  },
});
