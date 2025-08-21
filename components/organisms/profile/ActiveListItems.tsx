import Icons from "@/assets/Icons";
import { ActiveCard } from "@/components/molecules/profile/ActiveCard";
import { tokens } from "@/tamagui/token";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";

export const ActiveListItem = () => {
  const activeCards = [
    {
      id: 1,
      image: "product1" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 1,
      shipping: "Regular Shipping",
      total: 405.5,
    },
    {
      id: 2,
      image: "product2" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 2,
      shipping: "Regular Shipping",
      total: 405.5,
    },
    {
      id: 3,
      image: "product3" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 1,
      shipping: "Regular Shipping",
      total: 405.5,
    },
    {
      id: 4,
      image: "product3" as keyof typeof Icons,
      title: "Carvin Pumpkin Each Abbot Stoneware Cereal Bowl",
      qty: 4,
      shipping: "Regular Shipping",
      total: 405.5,
    },
  ];
  return (
    <YStack>
      <FlatList
        data={activeCards}
        renderItem={({ item }) => <ActiveCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Spacer size={tokens.space.md} />}
        contentContainerStyle={
          {
            // gap: tokens.space.md,
          }
        }
        scrollEnabled={true}
      />
    </YStack>
  );
};
