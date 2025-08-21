import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';

import {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

const FixedBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
);

export {FixedBackdrop};
