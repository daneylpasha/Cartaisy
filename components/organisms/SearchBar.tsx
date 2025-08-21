import { SearchInput } from "@/components/molecules/SearchInput";
import { t } from "@/translations";
import React, { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  width?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchBar = ({
  onSearch,
  width,
  onFocus,
  onBlur,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <SearchInput
      width={width}
      value={searchQuery}
      onChangeText={handleSearch}
      placeholder={`Search ${t("common.companyName")}`}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
