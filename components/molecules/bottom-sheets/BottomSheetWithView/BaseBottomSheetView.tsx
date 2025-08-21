import {BottomSheetView} from '@gorhom/bottom-sheet';

import {useBottomSheetSafeAreaStyle} from '../hooks';

type BottomSheetViewProps = Partial<Parameters<typeof BottomSheetView>[0]>;

type BaseBottomSheetViewProps = BottomSheetViewProps & {
  ignoreSafeArea?: boolean;
};

const BaseBottomSheetView = ({
  ignoreSafeArea,
  style: styleProp,
  children,
  ...props
}: BaseBottomSheetViewProps) => {
  const style = useBottomSheetSafeAreaStyle(styleProp, ignoreSafeArea);

  return (
    <BottomSheetView {...props} style={style}>
      {children}
    </BottomSheetView>
  );
};

export {BaseBottomSheetView};
