import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { OcrServiceError, runDocumentOcr } from "./lib/openai-ocr";

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));

app.post("/api/ocr/parse", async (c) => {
  try {
    const form = await c.req.formData();
    const expectedType = String(form.get("expectedType") ?? "");
    const files = form.getAll("files").filter((value): value is File => value instanceof File);

    if (!["sales", "purchase", "statement"].includes(expectedType)) {
      return c.json({ error: "Invalid document workflow." }, 400);
    }

    if (files.length === 0) {
      return c.json({ error: "No files uploaded." }, 400);
    }

    const results = [];
    for (const file of files) {
      results.push(await runDocumentOcr(file, expectedType as "sales" | "purchase" | "statement"));
    }
    const entries = results.flatMap((result) => result.entries);
    const exceptionPool = [
      ...results.flatMap((result) => result.exceptions),
      ...entries
        .filter((entry) => entry.status === "exception")
        .map((entry) => ({
          id: entry.id,
          sourceFile: entry.sourceFile,
          reason: "Entry needs review",
          details: entry.issues,
        })),
    ];
    const exceptions = exceptionPool.filter(
      (exception, index, all) =>
        all.findIndex(
          (item) =>
            item.sourceFile === exception.sourceFile &&
            item.reason === exception.reason &&
            JSON.stringify(item.details) === JSON.stringify(exception.details),
        ) === index,
    );

    return c.json({
      entries,
      exceptions,
      summary: results.map((result) => result.summary).join(" | "),
    });
  } catch (error) {
    console.error("[OCR] parse failed:", error);
    if (error instanceof OcrServiceError) {
      return c.json(
        {
          error: error.message,
        },
        error.status as 400 | 401 | 403 | 404 | 429 | 500 | 503,
      );
    }
    return c.json(
      {
        error: "Unable to scan the uploaded document right now.",
      },
      500,
    );
  }
});

app.all("/api/trpc/*", (c) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`[tRPC] ${path ?? "unknown"} failed:`, error);
    },
  })
);

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
