import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { ForwardedRef } from "react";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { Dimensions } from "react-native";
import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";
import { HandleComponent } from "../BaseBottomSheet/HandleComponent";
import {
  useBaseBottomSheetRef,
  useBottomSheetAnimationConfigsReducedMotionWorkaround,
  useBottomSheetBackHandler,
} from "../hooks";
import { bottomSheetStyles } from "../styles";
import type { BaseBottomSheetProps, BaseBottomSheetRef } from "../types";

const DEFAULT_MAX_DYNAMIC_CONTENT_SIZE = Dimensions.get("window").height * 0.7;

const BaseBottomSheetModal = forwardRef(
  (
    {
      index = -1,
      onChange,
      children,
      keyboardBehavior = "interactive",
      keyboardBlurBehavior = "restore",
      animateOnMount = true,
      disableBackgroundPress = false,
      enableDynamicSizing = true,
      maxDynamicContentSize = DEFAULT_MAX_DYNAMIC_CONTENT_SIZE,
      disableBackdrop = false,
      backdropOpacity = 0.5,
      handlePaddingBottom = "default",
      onBackgroundPress,
      enablePanDownToClose = true,
      ...props
    }: BaseBottomSheetProps<typeof BottomSheetModal>,
    ref: ForwardedRef<BaseBottomSheetRef>
  ) => {
    const {
      bottomSheetRef,
      handleOpenPress,
      handleClosePress,
      renderBackdrop,
    } = useBaseBottomSheetRef<BottomSheetModal>();

    const handleSheetChange = useBottomSheetBackHandler(
      index,
      handleClosePress,
      onChange
    );

    const animationConfigs =
      useBottomSheetAnimationConfigsReducedMotionWorkaround();

    // attach the open and closing handlers to the forwarded ref
    useImperativeHandle(ref, () => ({
      handleClosePress,
      handleOpenPress,
      snapToIndex: (
        snapIndex: number,
        config?: WithSpringConfig | WithTimingConfig
      ) => bottomSheetRef.current?.snapToIndex(snapIndex, config),
      close: (config?: WithSpringConfig | WithTimingConfig) =>
        bottomSheetRef.current?.close(config),
      expand: (config?: WithSpringConfig | WithTimingConfig) =>
        bottomSheetRef.current?.expand(config),
      collapse: (config?: WithSpringConfig | WithTimingConfig) =>
        bottomSheetRef.current?.collapse(config),
    }));

    const renderBackdropWithPressBehavior = useCallback(
      (bottomSheetBackdropProps: BottomSheetBackdropProps) =>
        renderBackdrop({
          ...bottomSheetBackdropProps,
          onPress: onBackgroundPress,
          opacity: backdropOpacity,
          pressBehavior: disableBackgroundPress ? "none" : "close",
        }),
      [
        renderBackdrop,
        onBackgroundPress,
        backdropOpacity,
        disableBackgroundPress,
      ]
    );

    const renderHandleComponent = useCallback(
      () => (
        <HandleComponent
          hasSmallerPaddingBottom={handlePaddingBottom === "small"}
        />
      ),
      [handlePaddingBottom]
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={index}
        handleIndicatorStyle={bottomSheetStyles.handleIndicator}
        animateOnMount={animateOnMount}
        backdropComponent={
          disableBackdrop ? undefined : renderBackdropWithPressBehavior
        }
        enablePanDownToClose={enablePanDownToClose}
        onChange={handleSheetChange}
        style={bottomSheetStyles.baseBottomSheet}
        backgroundStyle={bottomSheetStyles.backgroundStyle}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        animationConfigs={animationConfigs}
        enableDynamicSizing={enableDynamicSizing}
        maxDynamicContentSize={maxDynamicContentSize}
        handleComponent={renderHandleComponent}
        {...props}
      >
        {children}
      </BottomSheetModal>
    );
  }
);

BaseBottomSheetModal.displayName = "BaseBottomSheetModal";

export { BaseBottomSheetModal };
