import Icons from "@/assets/Icons";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { forwardRef } from "react";
import { ListRenderItem, ViewStyle } from "react-native";
import { BaseBottomSheetModal } from "./BottomSheetModal";

interface BottomSheetModalWithFlatListProps<T = any> {
  // Required props
  data: T[];
  renderItem: ListRenderItem<T>;

  // FlatList props - pass through as needed
  ListFooterComponent?: React.ReactElement | React.ComponentType<any>;
  ListHeaderComponent?: React.ReactElement | React.ComponentType<any>;
  keyExtractor?: (item: T, index: number) => string;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  style?: ViewStyle;
  icon?: keyof typeof Icons;
  iconPosition?: "left" | "right";
  // BottomSheet props
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  showBackdrop?: boolean;
  onDismiss?: () => void;

  // Footer button props - optional
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  secondaryButtonDisabled?: boolean;
  showFooter?: boolean;
}

export const BottomSheetModalWithFlatList = forwardRef<
  BottomSheetModal,
  BottomSheetModalWithFlatListProps
>(
  (
    {
      // Required
      data,
      renderItem,
      icon,
      iconPosition,
      // FlatList props
      ListFooterComponent,
      ListHeaderComponent,
      keyExtractor,
      contentContainerStyle,
      showsVerticalScrollIndicator = false,
      style,

      // BottomSheet props
      snapPoints = ["60%"],
      enableDynamicSizing = false,
      showBackdrop = true,
      onDismiss,

      // Footer button props
      onPrimaryPress,
      onSecondaryPress,
      primaryButtonLabel,
      secondaryButtonLabel,
      secondaryButtonDisabled,
      showFooter = false,
    },
    ref
  ) => {
    return (
      <BaseBottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        onPrimaryPress={onPrimaryPress}
        onSecondaryPress={onSecondaryPress}
        icon={icon}
        iconPosition={iconPosition}
        primaryButtonLabel={primaryButtonLabel}
        secondaryButtonLabel={secondaryButtonLabel}
        secondaryButtonDisabled={secondaryButtonDisabled}
        showFooter={showFooter}
        showBackdrop={showBackdrop}
        enableDynamicSizing={enableDynamicSizing}
        onDismiss={onDismiss}
      >
        <BottomSheetFlatList
          data={data}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          style={style}
          renderItem={renderItem}
        />
      </BaseBottomSheetModal>
    );
  }
);

BottomSheetModalWithFlatList.displayName = "BottomSheetModalWithFlatList";
