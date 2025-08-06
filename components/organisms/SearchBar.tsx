import { SearchInput } from "@/components/molecules/SearchInput";
import { t } from "@/translations";
import React, { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <SearchInput
      value={searchQuery}
      onChangeText={handleSearch}
      placeholder={`Search ${t("common.companyName")}`}
    />
  );
};
