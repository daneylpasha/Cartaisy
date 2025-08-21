import type {BaseBottomSheetFlatListProps} from '../types';

import {useMemo} from 'react';

import {View, StyleSheet, useWindowDimensions} from 'react-native';

import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

import {useBottomSheetSafeAreaStyle} from '../hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const BaseBottomSheetFlatList = <T,>({
  onLayout,
  HeaderComponent,
  style: styleProp,
  contentContainerStyle: contentContainerStyleProp,
  ignoreSafeArea,
  maxProportionOfWindowHeight = 0.7,
  children,
  ...flatListProps
}: BaseBottomSheetFlatListProps<T>) => {
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
    <View style={styles.container} onLayout={onLayout}>
      {HeaderComponent}
      <BottomSheetFlatList
        {...flatListProps}
        style={flatListStyle}
        contentContainerStyle={contentContainerStyle}
      />
      {children}
    </View>
  );
};

export {BaseBottomSheetFlatList};
