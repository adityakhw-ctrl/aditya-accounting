// Error reporting utility — logs to console only (no external services)

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  // Silently log to console for debugging
  if (typeof window !== "undefined") {
    console.error("[Error]", error, context);
  }
}
