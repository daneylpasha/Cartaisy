import { CollectionShowcaseItem } from "@/api/generated/cartaisyAPI.schemas";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextSMMedium } from "@/components/atoms/texts";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

type BrandsCollectionsProps = {
  brandsCollections?: CollectionShowcaseItem[];
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
        keyExtractor={(brand, index) => `brand-${index}`}
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
              router.push({
                pathname: "/products",
                params: {
                  collectionId: brand.collectionId,
                  categoryName: brand.title,
                },
              });
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
              {brand.title || ""}
            </TextSMMedium>
          </OpTouch>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </YStack>
  );
};

export default BrandsCollections;
