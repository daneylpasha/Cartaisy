import type {
  BaseBottomSheetRef,
  BottomSheetWithScrollViewProps,
} from "../types";

import { forwardRef, type ForwardedRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BaseBottomSheetModal } from "../BaseBottomSheetModal";
import { BaseBottomSheetScrollView } from "../BottomSheetWithScrollView/BaseBottomSheetScrollView";

const BottomSheetModalWithScrollViewWithoutRef = (
  {
    bottomSheetScrollViewProps,
    index = 0,
    ignoreSafeArea,
    maxProportionOfWindowHeight = 0.7,
    children,
    HeaderComponent,
    onLayout: onLayoutProp,
    ...props
  }: BottomSheetWithScrollViewProps<typeof BottomSheetModal>,
  ref: ForwardedRef<BaseBottomSheetRef>
) => (
  <BaseBottomSheetModal index={index} ref={ref} {...props}>
    <BaseBottomSheetScrollView
      {...bottomSheetScrollViewProps}
      ignoreSafeArea={ignoreSafeArea}
      maxProportionOfWindowHeight={maxProportionOfWindowHeight}
    >
      {children}
    </BaseBottomSheetScrollView>
  </BaseBottomSheetModal>
);

const BottomSheetModalWithScrollView = forwardRef(
  BottomSheetModalWithScrollViewWithoutRef
);

export { BottomSheetModalWithScrollView };
