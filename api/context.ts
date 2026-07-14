import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyToken, getAuthTokenFromRequest } from "./lib/auth";
import { getDb, hasDatabase } from "./queries/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { findDemoUserById } from "./lib/demo-users";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: "client" | "admin" | "super_admin";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: AuthUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const token = getAuthTokenFromRequest(opts.req);
  let user: AuthUser | undefined;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      if (!hasDatabase()) {
        const demoUser = await findDemoUserById(payload.userId);
        if (demoUser && demoUser.isActive === "true") {
          user = {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
          };
        }
      } else {
        const dbUser = await getDb()
          .select()
          .from(users)
          .where(eq(users.id, payload.userId))
          .limit(1);

        if (dbUser[0] && dbUser[0].isActive === "true") {
          user = {
            id: dbUser[0].id,
            email: dbUser[0].email,
            name: dbUser[0].name,
            role: dbUser[0].role,
          };
        }
      }
    }
  }

  return { req: opts.req, resHeaders: opts.resHeaders, user };
}
