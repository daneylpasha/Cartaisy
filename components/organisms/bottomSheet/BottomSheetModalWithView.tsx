import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { forwardRef } from "react";
import { ViewStyle } from "react-native";
import { BaseBottomSheetModal } from "./BottomSheetModal";
import Icons from "@/assets/Icons";

interface BottomSheetModalWithViewProps {
  // Required props
  children: React.ReactNode;
  
  // View styling props
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // BottomSheet props
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  showBackdrop?: boolean;
  
  // Footer button props - optional
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  showFooter?: boolean;
  icon?: keyof typeof Icons;
  iconPosition?: "left" | "right";
}

export const BottomSheetModalWithView = forwardRef<
  BottomSheetModal,
  BottomSheetModalWithViewProps
>(
  (
    {
      // Required
      children,
      
      // View styling props
      style,
      contentStyle,
      
      // BottomSheet props
      snapPoints = ["60%"],
      enableDynamicSizing = false,
      showBackdrop = true,
      
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
      >
        <BottomSheetView style={style} contentStyle={contentStyle}>
          {children}
        </BottomSheetView>
      </BaseBottomSheetModal>
    );
  }
);

BottomSheetModalWithView.displayName = "BottomSheetModalWithView";