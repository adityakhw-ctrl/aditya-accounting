import { hashPassword, verifyPassword } from "./auth";

type DemoRole = "client" | "admin" | "super_admin";

type DemoUserRecord = {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  role: DemoRole;
  isActive: "true" | "false";
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
};

const demoSeeds = [
  {
    id: 1,
    email: "adityakhw@gmail.com",
    password: "Aditya**1707",
    name: "Super Admin",
    role: "super_admin" as const,
  },
  {
    id: 2,
    email: "pro.aditya.ff3@gmail.com",
    password: "aditya*121",
    name: "Admin User",
    role: "admin" as const,
  },
  {
    id: 3,
    email: "aksharmabro979@gmail.com",
    password: "aditya*521",
    name: "Client User",
    role: "client" as const,
  },
];

let demoUsersPromise: Promise<DemoUserRecord[]> | undefined;

async function getDemoUsers() {
  if (!demoUsersPromise) {
    demoUsersPromise = Promise.all(
      demoSeeds.map(async (seed) => ({
        id: seed.id,
        email: seed.email.toLowerCase(),
        passwordHash: await hashPassword(seed.password),
        name: seed.name,
        role: seed.role,
        isActive: "true" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignInAt: new Date(),
      }))
    );
  }

  return demoUsersPromise;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findDemoUserByEmail(email: string) {
  const users = await getDemoUsers();
  return users.find((user) => user.email === normalizeEmail(email));
}

export async function findDemoUserById(id: number) {
  const users = await getDemoUsers();
  return users.find((user) => user.id === id);
}

export async function verifyDemoLogin(email: string, password: string) {
  const user = await findDemoUserByEmail(email);
  if (!user) {
    return { status: "not_found" as const };
  }

  if (user.isActive !== "true") {
    return { status: "inactive" as const, user };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { status: "wrong_password" as const, user };
  }

  user.lastSignInAt = new Date();
  user.updatedAt = new Date();

  return { status: "success" as const, user };
}

export async function listDemoUsers() {
  const users = await getDemoUsers();
  return users.map(({ passwordHash, ...user }) => user);
}
