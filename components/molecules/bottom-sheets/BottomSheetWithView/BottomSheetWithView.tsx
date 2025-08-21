import { forwardRef, type ForwardedRef } from "react";
import { BaseBottomSheet } from "../BaseBottomSheet";
import type { BaseBottomSheetRef, BottomSheetWithViewProps } from "../types";
import { BaseBottomSheetView } from "./BaseBottomSheetView";

const BottomSheetWithView = forwardRef(
  (
    {
      children,
      bottomSheetViewProps,
      index = -1,
      ...props
    }: BottomSheetWithViewProps,
    ref: ForwardedRef<BaseBottomSheetRef>
  ) => (
    <BaseBottomSheet index={index} ref={ref} {...props}>
      <BaseBottomSheetView {...bottomSheetViewProps}>
        {children}
      </BaseBottomSheetView>
    </BaseBottomSheet>
  )
);

export { BottomSheetWithView };
