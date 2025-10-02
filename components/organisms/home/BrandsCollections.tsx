import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextSMMedium } from "@/components/atoms/texts";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

type BrandCollection = {
  id: string;
  image: string;
  name: string;
};

type BrandShowcase = {
  _id: string;
  type: string;
  title: string;
  collections: BrandCollection[];
};

type BrandsCollectionsProps = {
  brandsCollections?: BrandShowcase[];
};

const BrandsCollections = ({
  brandsCollections: showcases,
}: BrandsCollectionsProps) => {
  const targetShowcase = showcases?.find(
    (showcase) => showcase.type === "circular"
  );

  if (!targetShowcase) {
    return null;
  }

  return (
    <YStack>
      <SectionHeader
        title={targetShowcase.title}
        tintColor={"darkgrey"}
        image="emptyStar"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$md"} />
      <FlatList
        data={targetShowcase.collections}
        keyExtractor={(brand) => brand.id}
        horizontal
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        renderItem={({ item: brand }) => (
          <OpTouch
            width={80}
            height={76}
            alignItems="center"
            onPress={() => {
              console.log("pressed");
            }}
          >
            <YStack
              backgroundColor={"white"}
              borderRadius={"$full"}
              alignItems="center"
              justifyContent="center"
              width={48}
              height={48}
              shadowColor="$black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={3.84}
              overflow="hidden"
            >
              <AppImage
                source={brand.image}
                width={50}
                height={50}
                resizeMode="cover"
              />
            </YStack>
            <Spacer size={"$sm"} />
            <TextSMMedium textAlign="center" color="$secondary">
              {brand.name || ""}
            </TextSMMedium>
          </OpTouch>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </YStack>
  );
};

export default BrandsCollections;
