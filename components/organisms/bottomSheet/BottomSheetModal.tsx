import Icons from "@/assets/Icons";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

interface BaseBottomSheetModalProps extends Omit<BottomSheetModalProps, "ref"> {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  showFooter?: boolean;
  showBackdrop?: boolean;
  enableDynamicSizing?: boolean;
  icon?: keyof typeof Icons;
  iconPosition?: "left" | "right";
}

export const BaseBottomSheetModal = forwardRef<
  BottomSheetModal,
  BaseBottomSheetModalProps
>(
  (
    {
      children,
      snapPoints = ["60%"],
      onPrimaryPress,
      onSecondaryPress,
      icon,

      iconPosition,
      primaryButtonLabel = "Apply",
      secondaryButtonLabel = "Add New Address",
      showFooter = true,
      showBackdrop = true,
      enableDynamicSizing = false,
      ...props
    },
    ref
  ) => {
    const { bottom: BOTTOM_INSET } = useSafeAreaInsets();

    const renderFooter = useCallback(
      (footerProps: any) => {
        if (!showFooter) return null;

        return (
          <BottomSheetFooter {...footerProps}>
            <YStack
              backgroundColor="$white"
              paddingTop="$md"
              borderTopWidth={StyleSheet.hairlineWidth}
              borderTopColor="#E6E6E6"
              paddingHorizontal="$md"
              paddingBottom={BOTTOM_INSET}
            >
              {onSecondaryPress && (
                <>
                  <SecondaryButton
                    onPress={onSecondaryPress}
                    label={secondaryButtonLabel}
                  />
                  <Spacer size="$reg" />
                </>
              )}
              {onPrimaryPress ? (
                <PrimaryButton
                  onPress={onPrimaryPress}
                  label={primaryButtonLabel}
                  icon={icon ? <AppImage name={icon} width={15} height={15} /> : undefined}
                  iconPosition={iconPosition}
                />
              ) : null}
            </YStack>
          </BottomSheetFooter>
        );
      },
      [
        BOTTOM_INSET,
        showFooter,
        onPrimaryPress,
        onSecondaryPress,
        primaryButtonLabel,
        secondaryButtonLabel,
      ]
    );

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => {
        if (!showBackdrop) return null;

        return (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
            opacity={0.5}
          />
        );
      },
      [showBackdrop]
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        footerComponent={showFooter ? renderFooter : undefined}
        backdropComponent={showBackdrop ? renderBackdrop : undefined}
        style={styles.container}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
        handleStyle={{ paddingBottom: BOTTOM_INSET }}
        {...props}
      >
        {children}
      </BottomSheetModal>
    );
  }
);

BaseBottomSheetModal.displayName = "BaseBottomSheetModal";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  background: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: "#CBD5E1",
  },
});
