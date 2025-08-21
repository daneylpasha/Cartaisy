import type {
  BaseBottomSheetRef,
  BottomSheetWithFlatListProps,
} from "../types";

import type { ForwardedRef, ReactElement } from "react";
import { forwardRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BaseBottomSheetModal } from "../BaseBottomSheetModal";
import { BaseBottomSheetFlatList } from "../BottomSheetWithFlatList/BaseBottomSheetFlatList";

const BottomSheetModalWithFlatListWithoutRef = <T,>(
  {
    bottomSheetFlatListProps,
    data,
    renderItem,
    index = 0,
    ignoreSafeArea,
    maxProportionOfWindowHeight = 0.7,
    children,
    HeaderComponent,
    onLayout: onLayoutProp,
    ...props
  }: BottomSheetWithFlatListProps<T, typeof BottomSheetModal>,
  ref: ForwardedRef<BaseBottomSheetRef>
) => (
  <BaseBottomSheetModal index={index} ref={ref} {...props}>
    <BaseBottomSheetFlatList
      {...bottomSheetFlatListProps}
      HeaderComponent={HeaderComponent}
      ignoreSafeArea={ignoreSafeArea}
      data={data}
      renderItem={renderItem}
      maxProportionOfWindowHeight={maxProportionOfWindowHeight}
    >
      {children}
    </BaseBottomSheetFlatList>
  </BaseBottomSheetModal>
);

const BottomSheetModalWithFlatList = forwardRef(
  BottomSheetModalWithFlatListWithoutRef
) as <T>(
  props: BottomSheetWithFlatListProps<T, typeof BottomSheetModal> & {
    ref: ForwardedRef<BaseBottomSheetRef>;
  }
) => ReactElement;

export { BottomSheetModalWithFlatList };
