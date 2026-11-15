import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    // Prisma 7 reads the seed command from here, not from package.json.
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: process.env.DATABASE_URL! },
});
