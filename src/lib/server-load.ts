export function logServerDataLoadError(scope: string, error: unknown) {
  console.error(`[server-data] ${scope} failed`, error);
}
