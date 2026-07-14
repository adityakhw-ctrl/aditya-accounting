import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { Errors } from "../contracts/errors";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// Authenticated procedure - requires valid user
export const authedQuery = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw Errors.unauthorized("Please sign in to access this resource");
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Admin procedure - requires admin or super_admin role
export const adminQuery = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw Errors.unauthorized("Please sign in to access this resource");
  }
  if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw Errors.forbidden("Admin access required");
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Super Admin procedure - requires super_admin role only
export const superAdminQuery = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw Errors.unauthorized("Please sign in to access this resource");
  }
  if (ctx.user.role !== "super_admin") {
    throw Errors.forbidden("Super Admin access required");
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
