import type {BaseBottomSheetSectionListProps} from '../types';

import {useMemo} from 'react';

import {View, StyleSheet, useWindowDimensions} from 'react-native';

import {BottomSheetSectionList} from '@gorhom/bottom-sheet';

import {useBottomSheetSafeAreaStyle} from '../hooks';

const BaseBottomSheetSectionList = <ItemT, SectionT>({
  onLayout,
  HeaderComponent,
  style: styleProp,
  contentContainerStyle: contentContainerStyleProp,
  ignoreSafeArea,
  maxProportionOfWindowHeight = 0.7,
  children,
  ...sectionListProps
}: BaseBottomSheetSectionListProps<ItemT, SectionT>) => {
  const {height: windowHeight} = useWindowDimensions();

  const flatListStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styleProp,
        {maxHeight: windowHeight * maxProportionOfWindowHeight},
      ]),
    [styleProp, windowHeight, maxProportionOfWindowHeight],
  );

  const contentContainerStyle = useBottomSheetSafeAreaStyle(
    contentContainerStyleProp,
    ignoreSafeArea,
  );

  return (
    <View onLayout={onLayout}>
      {HeaderComponent}
      <BottomSheetSectionList
        {...sectionListProps}
        style={flatListStyle}
        contentContainerStyle={contentContainerStyle}
      />
      {children}
    </View>
  );
};

export {BaseBottomSheetSectionList};
