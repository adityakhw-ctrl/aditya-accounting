import { getDb } from "../api/queries/connection";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../api/lib/auth";

async function seed() {
  const db = getDb();

  // Default users to create
  const defaultUsers = [
    {
      email: "adityakhw@gmail.com",
      password: "Aditya**1707",
      name: "Super Admin",
      role: "super_admin" as const,
    },
    {
      email: "pro.aditya.ff3@gmail.com",
      password: "aditya*121",
      name: "Admin User",
      role: "admin" as const,
    },
    {
      email: "aksharmabro979@gmail.com",
      password: "aditya*521",
      name: "Client User",
      role: "client" as const,
    },
  ];

  for (const userData of defaultUsers) {
    console.log(`Checking for user: ${userData.email}...`);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existing[0]) {
      console.log(`User already exists: ${userData.email} (${existing[0].role})`);
      continue;
    }

    console.log(`Creating user: ${userData.email} (${userData.role})...`);

    const passwordHash = await hashPassword(userData.password);

    await db.insert(users).values({
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
      isActive: "true",
    });

    console.log(`User created: ${userData.email} (${userData.role})`);
  }

  console.log("\nSeed completed!");
  console.log("\nDefault Users:");
  console.log("  Super Admin: adityakhw@gmail.com / Aditya**1707");
  console.log("  Admin:       pro.aditya.ff3@gmail.com / aditya*121");
  console.log("  Client:      aksharmabro979@gmail.com / aditya*521");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
