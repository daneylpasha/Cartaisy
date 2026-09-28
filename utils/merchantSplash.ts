/**
 * A persisted splash belongs to one store. `EXPO_PUBLIC_STORE_ID` can change
 * between launches while AsyncStorage still holds the previous tenant's
 * splash URL, so the early splash may paint only when both ids are present
 * and equal. Missing or mismatched ids fail closed.
 */
export function cachedSplashMatchesConfiguredStore(
  cachedStoreId: string | undefined,
  configuredStoreId: string | undefined,
): boolean {
  const cached = cachedStoreId?.trim() ?? "";
  const current = configuredStoreId?.trim() ?? "";
  if (!cached || !current) return false;
  return cached === current;
}
