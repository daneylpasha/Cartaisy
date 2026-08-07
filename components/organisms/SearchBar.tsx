import { SearchInput } from "@/components/molecules/SearchInput";
import { useCompanyName } from "@/hooks/useCompanyName";
import React, { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;

  width?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  value?: string; // Add value prop for controlled component
  onCancel?: () => void; // Add onCancel prop
  onSubmit?: (query: string) => void; // Add onSubmit prop for tracking
  oncleartext?: () => void;
}

export const SearchBar = ({
  onSearch,
  width,
  onFocus,
  onBlur,
  value: externalValue,
  onCancel,
  onSubmit,
}: SearchBarProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const companyName = useCompanyName();

  // Use external value if provided, otherwise use internal state
  const searchQuery =
    externalValue !== undefined ? externalValue : internalSearchQuery;

  const handleSearch = (text: string) => {
    setInternalSearchQuery(text);
    onSearch?.(text);
  };

  const handleSubmit = () => {
    if (searchQuery.trim().length >= 3) {
      onSubmit?.(searchQuery.trim());
    }
  };

  return (
    <SearchInput
      width={width}
      value={searchQuery}
      onChangeText={handleSearch}
      placeholder={`Search ${companyName}`}
      onFocus={onFocus}
      onBlur={onBlur}
      onCancel={onCancel}
      onSubmitEditing={handleSubmit}
    />
  );
};
