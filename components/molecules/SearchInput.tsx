import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  width?: number | string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  onCancel?: () => void; // Add onCancel callback
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
  onCancel,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleCancel = () => {
    console.log("🚫 SearchInput: Cancel button clicked");
    setIsFocused(false); // Immediately update focus state
    inputRef.current?.blur(); // Blur the input to dismiss keyboard
    onCancel?.();
  };

  const searchIcon = (
    <AppImage name="searchIcon" width={20} height={20} tintColor="$secondary" />
  );

  const cancelButton = isFocused ? (
    <OpTouch onPress={handleCancel}>
      <TextSMRegular color="$primary" fontSize={14}>
        Cancel
      </TextSMRegular>
    </OpTouch>
  ) : null;

  return (
    <FormInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || `Search ${t("common.companyName")}`}
      icon={searchIcon}
      rightElement={cancelButton}
      width={width}
      paddingHorizontal={tokens.space.md}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSubmitEditing={onSubmitEditing}
      borderRadius={tokens.radius.md}
      padding={tokens.space.sm}
      inputRef={inputRef}
    />
  );
};
