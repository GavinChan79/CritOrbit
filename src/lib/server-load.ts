export function logServerDataLoadError(scope: string, error: unknown) {
  console.error("DB ERROR:", error);
  console.error(`[server-data] ${scope} failed`, error);
}
