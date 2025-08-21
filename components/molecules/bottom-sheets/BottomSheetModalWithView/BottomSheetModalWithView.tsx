import type {BaseBottomSheetRef, BottomSheetWithViewProps} from '../types';

import type {ForwardedRef} from 'react';

import {forwardRef} from 'react';
import {BaseBottomSheetModal} from '../BaseBottomSheetModal';
import {BaseBottomSheetView} from '../BottomSheetWithView';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';

const BottomSheetModalWithView = forwardRef(
  (
    {
      children,
      bottomSheetViewProps,
      index = 0,
      ...props
    }: BottomSheetWithViewProps<typeof BottomSheetModal>,
    ref: ForwardedRef<BaseBottomSheetRef>,
  ) => (
    <BaseBottomSheetModal index={index} ref={ref} {...props}>
      <BaseBottomSheetView {...bottomSheetViewProps}>
        {children}
      </BaseBottomSheetView>
    </BaseBottomSheetModal>
  ),
);

export {BottomSheetModalWithView};
