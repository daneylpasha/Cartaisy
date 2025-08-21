import type {
  BaseBottomSheetRef,
  BottomSheetWithScrollViewProps,
} from '../types';

import {forwardRef, type ForwardedRef} from 'react';

import {BaseBottomSheetScrollView} from './BaseBottomSheetScrollView';
import {BaseBottomSheet} from '../BaseBottomSheet';

const BottomSheetWithScrollViewWithoutRef = (
  {
    bottomSheetScrollViewProps,
    index = -1,
    ignoreSafeArea,
    maxProportionOfWindowHeight = 0.7,
    children,
    HeaderComponent,
    onLayout: onLayoutProp,
    ...props
  }: BottomSheetWithScrollViewProps,
  ref: ForwardedRef<BaseBottomSheetRef>,
) => (
  <BaseBottomSheet index={index} ref={ref} {...props}>
    <BaseBottomSheetScrollView
      {...bottomSheetScrollViewProps}
      ignoreSafeArea={ignoreSafeArea}
      maxProportionOfWindowHeight={maxProportionOfWindowHeight}>
      {children}
    </BaseBottomSheetScrollView>
  </BaseBottomSheet>
);

const BottomSheetWithScrollView = forwardRef(
  BottomSheetWithScrollViewWithoutRef,
);

export {BottomSheetWithScrollView};
