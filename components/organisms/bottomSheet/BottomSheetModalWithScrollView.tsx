import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef } from "react";
import { ViewStyle } from "react-native";
import { BaseBottomSheetModal } from "./BottomSheetModal";
import Icons from "@/assets/Icons";
import type { WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

interface BottomSheetModalWithScrollViewProps {
  // Required props
  children: React.ReactNode;

  // View styling props
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;

  // BottomSheet props
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  showBackdrop?: boolean;
  onDismiss?: () => void;
  enablePanDownToClose?: boolean;
  animationConfigs?: WithSpringConfig | WithTimingConfig;

  // Footer button props - optional
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  showFooter?: boolean;
  icon?: keyof typeof Icons;
  iconPosition?: "left" | "right";
}

export const BottomSheetModalWithScrollView = forwardRef<
  BottomSheetModal,
  BottomSheetModalWithScrollViewProps
>(
  (
    {
      // Required
      children,

      // View styling props
      style,
      contentContainerStyle,

      // BottomSheet props
      snapPoints = ["60%"],
      enableDynamicSizing = false,
      showBackdrop = true,
      onDismiss,
      enablePanDownToClose = true,
      animationConfigs,

      // Footer button props
      onPrimaryPress,
      onSecondaryPress,
      primaryButtonLabel,
      secondaryButtonLabel,
      showFooter = false,
      icon,
      iconPosition,
    },
    ref
  ) => {
    return (
      <BaseBottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        onPrimaryPress={onPrimaryPress}
        onSecondaryPress={onSecondaryPress}
        primaryButtonLabel={primaryButtonLabel}
        secondaryButtonLabel={secondaryButtonLabel}
        showFooter={showFooter}
        showBackdrop={showBackdrop}
        enableDynamicSizing={enableDynamicSizing}
        icon={icon}
        iconPosition={iconPosition}
        onDismiss={onDismiss}
        enablePanDownToClose={enablePanDownToClose}
        animationConfigs={animationConfigs}
      >
        <BottomSheetScrollView
          style={style}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      </BaseBottomSheetModal>
    );
  }
);

BottomSheetModalWithScrollView.displayName = "BottomSheetModalWithScrollView";
