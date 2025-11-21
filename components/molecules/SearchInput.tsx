import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native";
import { getTokenValue } from "tamagui";

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

  oncleartext?: () => void;
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

  const searchIcon = (
    <AppImage name="searchIcon" width={18} height={18} tintColor="$secondary" />
  );

  let rightElement = null;

  if (isFocused && value.length > 0) {
    rightElement = (
      <OpTouch
        onPress={() => {
          onChangeText(""); // clear text
          inputRef.current?.focus(); // stay focused
        }}
      >
        <AppImage
          name="closeIcon"
          size={12}
          tintColor={getTokenValue("$primary")}
        />
      </OpTouch>
    );
  }

  // Show Cancel
  else if (isFocused && value.length === 0) {
    rightElement = (
      <OpTouch
        onPress={() => {
          onChangeText("");
          setIsFocused(false);
          inputRef.current?.blur();
          onCancel?.();
        }}
      >
        <TextSMRegular color="$primary" fontSize={14}>
          Cancel
        </TextSMRegular>
      </OpTouch>
    );
  }

  return (
    <FormInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || `Search ${t("common.companyName")}`}
      icon={searchIcon}
      rightElement={rightElement}
      width={width}
      paddingHorizontal={tokens.space.md}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSubmitEditing={onSubmitEditing}
      borderRadius={tokens.radius.md}
      paddingVertical={tokens.space["xs-sm"]}
      inputRef={inputRef}
    />
  );
};
