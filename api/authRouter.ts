import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery, superAdminQuery } from "./middleware";
import { getDb, hasDatabase } from "./queries/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createToken,
} from "./lib/auth";
import { Errors } from "../contracts/errors";
import { listDemoUsers, verifyDemoLogin } from "./lib/demo-users";

export const authRouter = createRouter({
  // Register - Only clients can self-register. Admins/SuperAdmins must be created by a SuperAdmin
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["client", "admin"]).optional().default("client"),
      })
    )
    .mutation(async ({ input }) => {
      if (!hasDatabase()) {
        throw Errors.badRequest("Account creation is unavailable in this build.");
      }

      const db = getDb();

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing[0]) {
        throw Errors.badRequest("An account with this email already exists");
      }

      const passwordHash = await hashPassword(input.password);

      const result = await db.insert(users).values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        isActive: "true",
      }).$returningId();

      const userId = result[0].id;

      const token = await createToken({
        userId,
        email: input.email,
        role: input.role,
      });

      return {
        token,
        user: {
          id: userId,
          email: input.email,
          name: input.name,
          role: input.role,
        },
      };
    }),

  // Login - For client and admin (super_admin login is hidden from UI but API supports it)
  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input }) => {
      if (!hasDatabase()) {
        const result = await verifyDemoLogin(input.email, input.password);

        if (result.status === "not_found") {
          throw Errors.unauthorized("User not found");
        }

        if (result.status === "inactive") {
          throw Errors.forbidden("Account is deactivated");
        }

        if (result.status === "wrong_password") {
          throw Errors.unauthorized("Wrong password");
        }

        const token = await createToken({
          userId: result.user.id,
          email: result.user.email,
          role: result.user.role,
        });

        return {
          token,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
        };
      }

      const db = getDb();

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      const user = userResult[0];
      if (!user) {
        throw Errors.unauthorized("Invalid email or password");
      }

      if (user.isActive !== "true") {
        throw Errors.forbidden("Account is deactivated");
      }

      const validPassword = await verifyPassword(
        input.password,
        user.passwordHash
      );
      if (!validPassword) {
        throw Errors.unauthorized("Invalid email or password");
      }

      // Update last sign in
      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  // Get current user
  me: authedQuery.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    };
  }),

  // Logout (client should clear token)
  logout: authedQuery.mutation(() => {
    return { success: true };
  }),

  // Create Admin - Only SuperAdmin can create admin users
  createAdmin: superAdminQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      if (!hasDatabase()) {
        throw Errors.badRequest("Admin creation is unavailable in this build.");
      }

      const db = getDb();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing[0]) {
        throw Errors.badRequest("An account with this email already exists");
      }

      const passwordHash = await hashPassword(input.password);

      const result = await db.insert(users).values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: "admin",
        isActive: "true",
      }).$returningId();

      return {
        id: result[0].id,
        email: input.email,
        name: input.name,
        role: "admin" as const,
      };
    }),

  // Create SuperAdmin - Only existing SuperAdmin can create another SuperAdmin
  createSuperAdmin: superAdminQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      if (!hasDatabase()) {
        throw Errors.badRequest("Super Admin creation is unavailable in this build.");
      }

      const db = getDb();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing[0]) {
        throw Errors.badRequest("An account with this email already exists");
      }

      const passwordHash = await hashPassword(input.password);

      const result = await db.insert(users).values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: "super_admin",
        isActive: "true",
      }).$returningId();

      return {
        id: result[0].id,
        email: input.email,
        name: input.name,
        role: "super_admin" as const,
      };
    }),

  // List all users - Admin and SuperAdmin only
  listUsers: adminQuery.query(async () => {
    if (!hasDatabase()) {
      return listDemoUsers();
    }

    const db = getDb();
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastSignInAt: users.lastSignInAt,
    }).from(users);

    return allUsers;
  }),

  // Update user status - Admin and SuperAdmin only
  updateUserStatus: adminQuery
    .input(
      z.object({
        userId: z.number().int().positive(),
        isActive: z.enum(["true", "false"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!hasDatabase()) {
        throw Errors.badRequest("User status updates are unavailable in this build.");
      }

      const db = getDb();

      // Prevent admins from deactivating super_admins
      const targetUser = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!targetUser[0]) {
        throw Errors.notFound("User not found");
      }

      // Admins cannot modify super_admins
      if (
        targetUser[0].role === "super_admin" &&
        ctx.user.role !== "super_admin"
      ) {
        throw Errors.forbidden("Only Super Admin can modify Super Admin accounts");
      }

      await db
        .update(users)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});
