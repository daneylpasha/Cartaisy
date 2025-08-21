import type BaseBottomSheet from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import type { BaseBottomSheetRef } from "./types";

import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import { Keyboard, Platform } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import {
  ANIMATION_CONFIGS,
  useBottomSheetInternal,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useBackHandler } from "@react-native-community/hooks";

import { ReduceMotion, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FixedBackdrop } from "./FixedBackdrop";

const useBottomSheetInputControls = ({
  onFocus,
  onBlur,
}: Partial<Pick<NonNullable<TextInputProps>, "onFocus" | "onBlur">>) => {
  const shouldHandleKeyboardEvents =
    useBottomSheetInternal(true)?.shouldHandleKeyboardEvents;

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = useCallback(
    (args) => {
      if (shouldHandleKeyboardEvents) {
        shouldHandleKeyboardEvents.value = true;
      }

      onFocus?.(args);
    },
    [onFocus, shouldHandleKeyboardEvents]
  );

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = useCallback(
    (args) => {
      if (shouldHandleKeyboardEvents) {
        shouldHandleKeyboardEvents.value = false;
      }

      onBlur?.(args);
    },
    [onBlur, shouldHandleKeyboardEvents]
  );

  useEffect(
    () => () => {
      if (shouldHandleKeyboardEvents) {
        shouldHandleKeyboardEvents.value = false;
      }
    },
    [shouldHandleKeyboardEvents]
  );

  return {
    handleFocus,
    handleBlur,
  };
};

const useBaseBottomSheetRef = <
  T extends BaseBottomSheet | BottomSheetModal = BaseBottomSheet
>() => {
  const [hasExpandedAtLeastOnce, setHasExpandedAtLeastOnce] = useState(false);

  const bottomSheetRef = useRef<T>(null);

  const handleClosePress = useCallback(
    (animationConfigs?: WithSpringConfig | WithTimingConfig) => {
      if (bottomSheetRef.current) {
        if ("dismiss" in bottomSheetRef.current) {
          // For BottomSheetModal
          bottomSheetRef.current.dismiss(animationConfigs);
        } else {
          // For BaseBottomSheet
          bottomSheetRef.current.close(animationConfigs);
        }
      }

      setHasExpandedAtLeastOnce(true);
    },
    []
  );

  const handleOpenPress = useCallback(() => {
    if (bottomSheetRef.current) {
      if ("present" in bottomSheetRef.current) {
        // For BottomSheetModal
        bottomSheetRef.current.present();
      } else {
        // For BaseBottomSheet
        bottomSheetRef.current.expand();
      }
    }

    setHasExpandedAtLeastOnce(true);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => {
      /*
       *
       * As of "@gorhom/bottom-sheet@4.1.5" there was a bug on Android where the `BottomSheetBackdrop` component would invisibly overlay the rest of the screen without passing through touch events. This is a workaround.
       * See here for more info: https://github.com/gorhom/react-native-bottom-sheet/issues/701#issuecomment-961296622
       *
       */

      if (!hasExpandedAtLeastOnce) {
        return null;
      }

      return <FixedBackdrop {...props} />;
    },
    [hasExpandedAtLeastOnce]
  );

  return {
    bottomSheetRef,
    handleClosePress,
    handleOpenPress,
    renderBackdrop,
  };
};

const useBottomSheetBackHandler = (
  initialIndex: number,
  handleClosePress: () => void,
  onChange?: (index: number, position?: number, type?: any) => void
) => {
  const currentIndex = useRef(initialIndex);
  const handleSheetChange = useCallback(
    (idx: number, position?: number, type?: any) => {
      currentIndex.current = idx;

      if (idx === initialIndex) {
        Keyboard.dismiss();
      }

      onChange?.(idx, position, type);
    },
    [onChange, initialIndex]
  );

  useBackHandler(() => {
    if (currentIndex.current !== initialIndex) {
      handleClosePress();

      return true;
    }

    return false;
  });

  return handleSheetChange;
};

const useBottomSheetSafeAreaStyle = (
  styleFromProp?: StyleProp<ViewStyle>,
  ignoreSafeArea?: boolean
) => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  const finalStyle = useMemo(() => {
    const safeAreaStyle: ViewStyle = { paddingBottom: bottomSafeAreaInset };

    if (styleFromProp && !ignoreSafeArea) {
      return [styleFromProp, safeAreaStyle];
    }

    if (styleFromProp && ignoreSafeArea) {
      return styleFromProp;
    }

    if (!ignoreSafeArea) {
      return safeAreaStyle;
    }

    return undefined;
  }, [bottomSafeAreaInset, ignoreSafeArea, styleFromProp]);

  return finalStyle as StyleProp<ViewStyle> | undefined;
};

type Options<ContentTypes extends string[]> = {
  autoDismissKeyboardOnClose?: boolean;
  initialContentType?: ContentTypes[number];
  onClose?: () => void;
};

const useBottomSheetWithControls = <
  RefType extends BaseBottomSheetRef,
  ContentTypes extends string[] = []
>(
  configuration?: Options<ContentTypes>
) => {
  const onClose = configuration?.onClose;
  const initialContentType = configuration?.initialContentType;
  const autoDismissKeyboardOnClose =
    configuration?.autoDismissKeyboardOnClose ?? true;

  const sheetRef = useRef<RefType>(null);

  const [contentType, setContentType] = useState<ContentTypes[number]>(
    initialContentType ?? ""
  );

  const handleOpenBottomSheet = useCallback(
    () => sheetRef.current?.handleOpenPress(),
    []
  );

  const handleCloseBottomSheet = useCallback(
    () => sheetRef.current?.handleClosePress(),
    []
  );

  const handleOnClose = useCallback(() => {
    onClose?.();

    if (autoDismissKeyboardOnClose) {
      Keyboard.dismiss();
    }

    setContentType("");
  }, [autoDismissKeyboardOnClose, onClose]);

  // The content of the bottomSheet is determined within `getBottomSheetUI`.
  // Open the bottomSheet when `bottomSheetContentType` changes to something truthy
  useEffect(() => {
    if (contentType) {
      handleOpenBottomSheet();
    }
  }, [contentType, handleOpenBottomSheet]);

  return {
    sheetRef,
    handleOpenBottomSheet,
    handleCloseBottomSheet,
    handleOnClose,
    contentType,
    setContentType,
  };
};

const useBottomSheetAnimationConfigsReducedMotionWorkaround = ():
  | WithTimingConfig
  | undefined => {
  const reducedMotion = useReducedMotion();
  const iOSAnimationConfigWithoutReducedMotion = useBottomSheetSpringConfigs({
    ...ANIMATION_CONFIGS,
    reduceMotion: ReduceMotion.Never,
  });

  if (Platform.OS !== "ios" || !reducedMotion) {
    return undefined;
  }

  return iOSAnimationConfigWithoutReducedMotion;
};

export {
  useBaseBottomSheetRef,
  useBottomSheetAnimationConfigsReducedMotionWorkaround,
  useBottomSheetBackHandler,
  useBottomSheetInputControls,
  useBottomSheetSafeAreaStyle,
  useBottomSheetWithControls,
};
