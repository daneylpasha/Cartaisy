import { ShopperState } from "@/components/molecules/ShopperState";
import { t } from "@/translations";
import React from "react";

export const EmptySearches = () => {
  return (
    <ShopperState
      presentation="illustration"
      icon="researchIcon"
      illustrationWidth={160}
      illustrationHeight={160}
      title={t("search.emptySearches.title")}
      message={t("search.emptySearches.subtitle")}
      minHeight={420}
    />
  );
};
