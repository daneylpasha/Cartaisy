import BottomSheet, {
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  type ForwardedRef,
} from "react";
import { Dimensions } from "react-native";
import {
  useBaseBottomSheetRef,
  useBottomSheetAnimationConfigsReducedMotionWorkaround,
  useBottomSheetBackHandler,
} from "../hooks";
import { bottomSheetStyles } from "../styles";
import type { BaseBottomSheetProps, BaseBottomSheetRef } from "../types";
import { HandleComponent } from "./HandleComponent";

const DEFAULT_MAX_DYNAMIC_CONTENT_SIZE = Dimensions.get("window").height * 0.7;

const BaseBottomSheet = forwardRef(
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
      onBackgroundPress,
      enablePanDownToClose = true,
      ...props
    }: BaseBottomSheetProps,
    ref: ForwardedRef<BaseBottomSheetRef>
  ) => {
    const {
      bottomSheetRef,
      handleOpenPress,
      handleClosePress,
      renderBackdrop,
    } = useBaseBottomSheetRef<BottomSheet>();

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
      snapToIndex: (snapIndex: number) =>
        bottomSheetRef.current?.snapToIndex(snapIndex),
      close: () => bottomSheetRef.current?.close(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
    }));

    const renderBackdropWithPressBehavior = useCallback(
      (bottomSheetBackdropProps: BottomSheetBackdropProps) =>
        renderBackdrop({
          ...bottomSheetBackdropProps,
          onPress: onBackgroundPress,
          pressBehavior: disableBackgroundPress ? "none" : "close",
        }),
      [disableBackgroundPress, renderBackdrop, onBackgroundPress]
    );

    const renderHandleComponent = useCallback(() => <HandleComponent />, []);

    return (
      <BottomSheet
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
      </BottomSheet>
    );
  }
);

BaseBottomSheet.displayName = "BaseBottomSheet";

export { BaseBottomSheet };
