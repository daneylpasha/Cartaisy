/**
 * Extracts numeric ID from Shopify GID format
 * Example: "gid://shopify/Collection/627944194420" -> "627944194420"
 * If already numeric, returns as-is
 */
export const extractNumericId = (gid: string | undefined | null): string => {
  if (!gid) return "";

  // If it's already numeric, return as is
  if (!gid.includes("gid://")) {
    return gid;
  }

  const parts = gid.split("/");
  return parts[parts.length - 1];
};
