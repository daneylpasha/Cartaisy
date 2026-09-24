import { ShopperState } from "@/components/molecules/ShopperState";
import { getCatalogUnavailableMessage } from "@/utils/catalogUnavailableError";

type CatalogUnavailableStateProps = {
  error?: unknown;
  minHeight?: number;
  message?: string;
  onRetry?: () => void;
  title?: string;
};

export const CatalogUnavailableState = ({
  error,
  minHeight,
  message,
  onRetry,
  title = "Catalog unavailable",
}: CatalogUnavailableStateProps) => {
  const fallbackMessage =
    message ||
    getCatalogUnavailableMessage(error) ||
    "We couldn't load this catalog. Please try again.";

  return (
    <ShopperState
      title={title}
      message={fallbackMessage}
      icon="warningIcon"
      minHeight={minHeight}
      actionLabel={onRetry ? "Try again" : undefined}
      onAction={onRetry}
    />
  );
};
