import { ShopperState } from "@/components/molecules/ShopperState";
import { t } from "@/translations";
import React from "react";

export const EmptySearches = () => {
  return (
    <ShopperState
      icon="searchIcon"
      title={t("search.emptySearches.title")}
      message={t("search.emptySearches.subtitle")}
      minHeight={420}
    />
  );
};
