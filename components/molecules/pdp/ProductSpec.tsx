import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";
type ProductSpecProps = {
  item: { label: string; value: string }[];
  showLabel?: boolean;
};

const ProductSpec = ({ item, showLabel = true }: ProductSpecProps) => {
  return (
    <YStack paddingHorizontal={"$md"}>
      <FlatList
        data={item}
        renderItem={({ item }) => (
          <XStack paddingVertical={"$sm"}>
            <TextSMMedium width={108} color="$secondary">
              {item.label}
            </TextSMMedium>
            <Spacer size={"$lg"} />
            <TextSMSemiBold flexShrink={1}>{item.value}</TextSMSemiBold>
          </XStack>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      />
    </YStack>
  );
};

export default ProductSpec;
