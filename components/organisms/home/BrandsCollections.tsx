import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextSMMedium } from "@/components/atoms/texts";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

const BrandsCollections = () => {
  const brandsData = [
    { id: "1", image: "apple" as const, name: "Apple" },
    { id: "2", image: "samsung" as const, name: "Samsung" },
    { id: "3", image: "nike" as const, name: "Nike" },
    { id: "4", image: "nintendo" as const, name: "Nintendo" },
    { id: "5", image: "playstation" as const, name: "Playstation" },
  ];
  const getBrandImageSize = (brandName: string) => {
    switch (brandName.toLowerCase()) {
      case "apple":
        return { width: 27.75, height: 31.5 };
      case "samsung":
        return { width: 36.23, height: 5.55 };
      case "nike":
        return { width: 39, height: 13.5 };
      case "nintendo":
        return { width: 46.6, height: 12 };
      case "playstation":
        return { width: 40.8, height: 33.15 };
      default:
        return { width: 24, height: 24 };
    }
  };

  const getBrandBackgroundColor = (brandName: string) => {
    switch (brandName.toLowerCase()) {
      case "nintendo":
        return "$error";
      default:
        return "$white";
    }
  };

  return (
    <FlatList
      data={brandsData}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      contentContainerStyle={{
        paddingHorizontal: tokens.space.md,
        gap: tokens.space.md,
      }}
      renderItem={({ item }) => (
        <OpTouch
          //   width={GRID_CARD_WIDTH}
          width={80}
          height={76}
          alignItems="center"
          onPress={() => {
            console.log("pressed");
          }}
        >
          <YStack
            backgroundColor={getBrandBackgroundColor(item.name)}
            borderRadius={"$full"}
            alignItems="center"
            justifyContent="center"
            width={48}
            height={48}
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={3.84}
          >
            <AppImage
              name={item.image}
              width={getBrandImageSize(item.name).width}
              height={getBrandImageSize(item.name).height}
              resizeMode="contain"
            />
          </YStack>
          <Spacer size={"$sm"} />
          <TextSMMedium textAlign="center" color="$secondary">
            {item.name}
          </TextSMMedium>
        </OpTouch>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default BrandsCollections;
