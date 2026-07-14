import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));

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
