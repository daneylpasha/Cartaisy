import React from "react";
import { FlatList, ListRenderItem, StyleSheet } from "react-native";
import { XStack, YStack } from "tamagui";
import { TextSMSemiBold } from "../../../components/atoms/texts";

type PasswordStrengthBarProps = {
  password: string;
};

type StrengthBarItem = {
  id: string;
  index: number;
};

const strengthBars: StrengthBarItem[] = [
  { id: "bar1", index: 0 },
  { id: "bar2", index: 1 },
  { id: "bar3", index: 2 },
  { id: "bar4", index: 3 },
];

const PasswordStrengthBar = ({ password }: PasswordStrengthBarProps) => {
  const getStrengthLevel = (password: string) => {
    if (password.length === 0) return 0;
    if (password.length <= 3) return 1;
    if (password.length <= 6) return 2;
    if (password.length <= 8) return 3;
    return 4;
  };

  const getStrengthText = (level: number) => {
    switch (level) {
      case 0:
        return "Enter password";
      case 1:
        return "Weak! Please add more strength!";
      case 2:
        return "Fair! Keep going!";
      case 3:
        return "Good! Almost there!";
      case 4:
        return "Password strength: Great!";
      default:
        return "Enter password";
    }
  };

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 0:
        return "$grey";
      case 1:
        return "$error"; // Red for weak
      case 2:
        return "#FFA500"; // Orange
      case 3:
        return "#FFD700"; // Yellow
      case 4:
        return "#4CAF50"; // Green
      default:
        return "$grey";
    }
  };

  const getStrengthIcon = (level: number) => {
    switch (level) {
      case 0:
        return null;
      case 1:
        return "💪";
      case 2:
        return "👍";
      case 3:
        return "🎯";
      case 4:
        return "✅";
      default:
        return null;
    }
  };

  const renderStrengthBar: ListRenderItem<StrengthBarItem> = ({ item }) => {
    const strengthLevel = getStrengthLevel(password);
    const strengthColor = getStrengthColor(strengthLevel);

    return (
      <YStack
        width={82.5}
        height={4}
        backgroundColor={item.index < strengthLevel ? strengthColor : "$grey"}
        borderRadius="$full"
      />
    );
  };

  const strengthLevel = getStrengthLevel(password);
  const strengthText = getStrengthText(strengthLevel);
  const strengthColor = getStrengthColor(strengthLevel);
  const strengthIcon = getStrengthIcon(strengthLevel);

  return (
    <YStack gap="$sm">
      <FlatList
        data={strengthBars}
        renderItem={renderStrengthBar}
        keyExtractor={(item) => item.id}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={Styles.container}
      />

      {strengthLevel ? (
        <XStack gap="$xs">
          <TextSMSemiBold color="$textgrey">{strengthText}</TextSMSemiBold>

          {strengthIcon && (
            <TextSMSemiBold fontSize="$3">{strengthIcon}</TextSMSemiBold>
          )}
        </XStack>
      ) : null}
    </YStack>
  );
};

const Styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
});

export default PasswordStrengthBar;
