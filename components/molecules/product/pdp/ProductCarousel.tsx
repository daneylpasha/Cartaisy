import Icons from "@/assets/Icons";
import { TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { tokens } from "@/tamagui/token";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";
import { Stack, XStack, YStack } from "tamagui";

type Props = {
  images: (keyof typeof Icons)[] | keyof typeof Icons | string[] | string;
  height?: number;
  borderRadius?: number;
  showCounter?: boolean;
  dotSize?: number;
  dotColor?: string;
  activeDotColor?: string;
  onImagePress?: (index: number) => void;
};

export default function ProductCarousel({
  images,
  height,
  borderRadius = 0,
  showCounter = true,
  dotSize = 8,
  dotColor = "#D1D5DB",
  activeDotColor = tokens.color.primary,
  onImagePress,
}: Props) {
  const { width } = useWindowDimensions();
  const h = height ?? width;

  // ✅ always array - handle both icon names and URLs
  const data: string[] = Array.isArray(images)
    ? images.map((img) => String(img))
    : [String(images)];
  const total = data.length;

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<string>>(null);

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
    <YStack style={{ width, height: h, borderRadius, overflow: "hidden" }}>
      {showCounter && (
        <XStack
          position="absolute"
          top={20}
          left={10}
          zIndex={2}
          borderWidth={1}
          borderColor="$icon"
          paddingHorizontal={"$reg"}
          paddingVertical={"$xs-sm"}
          borderRadius={"$full"}
        >
          <TextSMMedium>{total ? `${index + 1}/${total}` : "0/0"}</TextSMMedium>
        </XStack>
      )}

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item, i) => `${item}-${i}`}
        renderItem={({ item, index: i }) => (
          <YStack alignItems="center" justifyContent="center" width={width}>
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
                {item.startsWith("http") || item.startsWith("https") ? (
                  <AppImage
                    resizeMode="cover"
                    source={item}
                    width={width}
                    height={h}
                  />
                ) : (
                  <AppImage
                    name={item as keyof typeof Icons}
                    width={width}
                    height={h}
                  />
                )}
              </Stack>
            </OpTouch>

            {/* Overlay buttons - positioned above image but with pointerEvents="box-none" */}
            <XStack style={styles.blurviewcontainer} pointerEvents="box-none">
              <OpTouch
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
              </OpTouch>
              <Spacer size={"$reg"} />
              <OpTouch
                style={{ zIndex: 100 }}
                onPress={() => {
                  // Handle wishlist button press
                }}
              >
                <BlurView intensity={45} tint="dark" style={styles.blurView}>
                  <AppImage
                    name="heart"
                    tintColor="$black"
                    width={21}
                    height={18}
                  />
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

      <Spacer size={"$md"} />

      <XStack alignItems="center" justifyContent="center">
        {data.map((item, i) => (
          <OpTouch
            key={`dot-${item}-${i}`}
            onPress={() => goTo(i)}
            style={{ paddingHorizontal: 4 }}
          >
            <Stack
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: i === index ? activeDotColor : dotColor,
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
