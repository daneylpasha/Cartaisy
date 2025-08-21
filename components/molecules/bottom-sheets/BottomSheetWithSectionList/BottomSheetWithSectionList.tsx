import type {
  BaseBottomSheetRef,
  BottomSheetWithSectionListProps,
} from '../types';

import type {ForwardedRef, ReactElement} from 'react';
import {forwardRef} from 'react';

import {BaseBottomSheetSectionList} from './BaseBottomSheetSectionList';
import {BaseBottomSheet} from '../BaseBottomSheet';

const BottomSheetWithSectionListWithoutRef = <ItemT, SectionT>(
  {
    bottomSheetSectionListProps,
    sections,
    renderItem,
    index = -1,
    ignoreSafeArea,
    maxProportionOfWindowHeight = 0.7,
    children,
    HeaderComponent,
    onLayout: onLayoutProp,
    ...props
  }: BottomSheetWithSectionListProps<ItemT, SectionT>,
  ref: ForwardedRef<BaseBottomSheetRef>,
) => (
  <BaseBottomSheet index={index} ref={ref} {...props}>
    <BaseBottomSheetSectionList
      {...bottomSheetSectionListProps}
      HeaderComponent={HeaderComponent}
      ignoreSafeArea={ignoreSafeArea}
      sections={sections}
      renderItem={renderItem}
      maxProportionOfWindowHeight={maxProportionOfWindowHeight}>
      {children}
    </BaseBottomSheetSectionList>
  </BaseBottomSheet>
);

const BottomSheetWithSectionList = forwardRef(
  BottomSheetWithSectionListWithoutRef,
) as <ItemT, SectionT>(
  props: BottomSheetWithSectionListProps<ItemT, SectionT> & {
    ref: ForwardedRef<BaseBottomSheetRef>;
  },
) => ReactElement;

export {BottomSheetWithSectionList};
