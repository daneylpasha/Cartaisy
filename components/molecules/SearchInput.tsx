import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React from "react";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  width?: number | string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

export const SearchInput = ({
  value,
  onChangeText,
  placeholder,
  width = "100%",
  onClear,
  onFocus,
  onBlur,
  onSubmitEditing,
}: SearchInputProps) => {
  const searchIcon = (
    <AppImage name="searchIcon" width={20} height={20} tintColor="$secondary" />
  );

  return (
    <FormInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || `Search ${t("common.companyName")}`}
      icon={searchIcon}
      width={width}
      paddingHorizontal={tokens.space.md}
      onFocus={onFocus}
      onBlur={onBlur}
      onSubmitEditing={onSubmitEditing}
      borderRadius={tokens.radius.md}
      padding={tokens.space.sm}
    />
  );
};
