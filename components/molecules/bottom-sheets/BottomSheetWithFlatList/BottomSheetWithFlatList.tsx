import type {BaseBottomSheetRef, BottomSheetWithFlatListProps} from '../types';

import type {ForwardedRef, ReactElement} from 'react';
import {forwardRef} from 'react';

import {BaseBottomSheetFlatList} from './BaseBottomSheetFlatList';
import {BaseBottomSheet} from '../BaseBottomSheet';

const BottomSheetWithFlatListWithoutRef = <T,>(
  {
    bottomSheetFlatListProps,
    data,
    renderItem,
    index = -1,
    ignoreSafeArea,
    maxProportionOfWindowHeight = 0.7,
    children,
    HeaderComponent,
    onLayout: onLayoutProp,
    ...props
  }: BottomSheetWithFlatListProps<T>,
  ref: ForwardedRef<BaseBottomSheetRef>,
) => (
  <BaseBottomSheet index={index} ref={ref} {...props}>
    <BaseBottomSheetFlatList
      {...bottomSheetFlatListProps}
      HeaderComponent={HeaderComponent}
      ignoreSafeArea={ignoreSafeArea}
      data={data}
      renderItem={renderItem}
      maxProportionOfWindowHeight={maxProportionOfWindowHeight}>
      {children}
    </BaseBottomSheetFlatList>
  </BaseBottomSheet>
);

const BottomSheetWithFlatList = forwardRef(
  BottomSheetWithFlatListWithoutRef,
) as <T>(
  props: BottomSheetWithFlatListProps<T> & {
    ref: ForwardedRef<BaseBottomSheetRef>;
  },
) => ReactElement;

export {BottomSheetWithFlatList};
