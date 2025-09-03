import type { BaseBottomSheetScrollViewProps } from "../types";

import { useMemo } from "react";

import { StyleSheet, useWindowDimensions } from "react-native";

import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { useBottomSheetSafeAreaStyle } from "../hooks";

const BaseBottomSheetScrollView = ({
  style: styleProp,
  contentContainerStyle: contentContainerStyleProp,
  ignoreSafeArea,
  maxProportionOfWindowHeight = 0.7,
  children,
  ...scrollViewProps
}: BaseBottomSheetScrollViewProps) => {
  const { height: windowHeight } = useWindowDimensions();

  const scrollViewStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styleProp,
        { maxHeight: windowHeight * maxProportionOfWindowHeight },
      ]),
    [styleProp, windowHeight, maxProportionOfWindowHeight]
  );

  const contentContainerStyle = useBottomSheetSafeAreaStyle(
    // @ts-expect-error - `contentContainerStyleProp` is not a `ViewStyle`
    contentContainerStyleProp,
    ignoreSafeArea
  );

  return (
    <BottomSheetScrollView
      {...scrollViewProps}
      // @ts-expect-error - `scrollViewStyle` is not a `ViewStyle`
      style={scrollViewStyle}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </BottomSheetScrollView>
  );
};

export { BaseBottomSheetScrollView };
