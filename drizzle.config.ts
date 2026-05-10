import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema/balance-tracker.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["balance"],
});
