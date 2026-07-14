// Stub connection — real DB wiring not present in this frontend-focused project.
export function getDb(): any {
  throw new Error("Database is not configured in this build.");
}

export function hasDatabase() {
  return false;
}
