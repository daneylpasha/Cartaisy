import type BottomSheet from "@gorhom/bottom-sheet";
import type { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetScrollViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";
import type {
  FlatListProps,
  LayoutChangeEvent,
  SectionListProps,
  ViewProps,
} from "react-native/types";

import type { ReactNode } from "react";

type BaseBottomSheetRef = {
  handleClosePress: () => void;
  handleOpenPress: () => void;
} & Pick<BottomSheet, "snapToIndex" | "close" | "expand" | "collapse">;

type BottomSheetComponent = typeof BottomSheet | typeof BottomSheetModal;

type BaseBottomSheetProps<T extends BottomSheetComponent = typeof BottomSheet> =
  Omit<Parameters<T>[0], "ref"> & {
    disableBackgroundPress?: boolean;
    onBackgroundPress?: () => void;
    disableBackdrop?: boolean;
    handlePaddingBottom?: "small" | "default";
    backdropOpacity?: number;
    onChange?: (index: number, position?: number, type?: any) => void;
  };

type BottomSheetViewProps = Partial<Parameters<typeof BottomSheetView>[0]>;

type BaseBottomSheetViewProps = BottomSheetViewProps & {
  ignoreSafeArea?: boolean;
  children: BottomSheetViewProps["children"];
};

type BottomSheetWithViewProps<
  SheetType extends BottomSheetComponent = typeof BottomSheet
> = Partial<BaseBottomSheetProps<SheetType>> & {
  children: BaseBottomSheetViewProps["children"];
  bottomSheetViewProps?: Omit<BaseBottomSheetViewProps, "children">;
};

type BaseBottomSheetScrollViewProps = BottomSheetScrollViewProps &
  Pick<
    BottomSheetWithSectionListProps<unknown, unknown>,
    "children" | "ignoreSafeArea" | "maxProportionOfWindowHeight"
  >;

type BaseBottomSheetSectionListProps<ItemT, SectionT> = Pick<
  ViewProps,
  "onLayout"
> &
  SectionListProps<ItemT, SectionT> &
  Pick<
    BottomSheetWithSectionListProps<ItemT, SectionT>,
    | "HeaderComponent"
    | "children"
    | "ignoreSafeArea"
    | "maxProportionOfWindowHeight"
  >;

type BaseBottomSheetFlatListProps<T> = Pick<ViewProps, "onLayout"> &
  FlatListProps<T> &
  Pick<
    BottomSheetWithFlatListProps<T>,
    | "HeaderComponent"
    | "children"
    | "ignoreSafeArea"
    | "maxProportionOfWindowHeight"
  >;

type BottomSheetWithFlatListProps<
  T,
  SheetType extends BottomSheetComponent = typeof BottomSheet
> = Partial<Omit<BaseBottomSheetProps<SheetType>, "snapPoints" | "children">> &
  Partial<BaseBottomSheetProps<SheetType>> & {
    HeaderComponent?: ReactNode;
    children?: ReactNode;
    data: T[];
    renderItem: FlatListProps<T>["renderItem"];
    bottomSheetFlatListProps?: Omit<
      BaseBottomSheetFlatListProps<T>,
      "data" | "renderItem" | "children" | "onLayout"
    >;
    onLayout?: (e: LayoutChangeEvent) => void;
    ignoreSafeArea?: boolean;
    maxProportionOfWindowHeight?: number;
  };

type BottomSheetWithScrollViewProps<
  SheetType extends BottomSheetComponent = typeof BottomSheet
> = Partial<Omit<BaseBottomSheetProps<SheetType>, "snapPoints" | "children">> &
  Partial<BaseBottomSheetProps<SheetType>> & {
    HeaderComponent?: ReactNode;
    children?: ReactNode;
    bottomSheetScrollViewProps?: Omit<
      BaseBottomSheetScrollViewProps,
      "onLayout" | "children"
    >;
    onLayout?: (e: LayoutChangeEvent) => void;
    ignoreSafeArea?: boolean;
    maxProportionOfWindowHeight?: number;
  };

type BottomSheetWithSectionListProps<
  ItemT,
  SectionT,
  SheetType extends BottomSheetComponent = typeof BottomSheet
> = Partial<Omit<BaseBottomSheetProps<SheetType>, "snapPoints" | "children">> &
  Partial<BaseBottomSheetProps<SheetType>> & {
    HeaderComponent?: ReactNode;
    children?: ReactNode;
    sections: SectionListProps<ItemT, SectionT>["sections"];
    renderItem: SectionListProps<ItemT, SectionT>["renderItem"];
    bottomSheetSectionListProps?: Omit<
      BaseBottomSheetSectionListProps<ItemT, SectionT>,
      "sections" | "renderItem" | "children" | "onLayout"
    >;
    onLayout?: (e: LayoutChangeEvent) => void;
    ignoreSafeArea?: boolean;
    maxProportionOfWindowHeight?: number;
  };

export type {
  BaseBottomSheetFlatListProps,
  BaseBottomSheetProps,
  BaseBottomSheetRef,
  BaseBottomSheetScrollViewProps,
  BaseBottomSheetSectionListProps,
  BottomSheetViewProps,
  BottomSheetWithFlatListProps,
  BottomSheetWithScrollViewProps,
  BottomSheetWithSectionListProps,
  BottomSheetWithViewProps,
};
