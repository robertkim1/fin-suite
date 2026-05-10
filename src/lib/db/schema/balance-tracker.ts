import { pgSchema, uuid, varchar, decimal, date, timestamp } from "drizzle-orm/pg-core";

export const balanceSchema = pgSchema("balance");

export const transactions = balanceSchema.table("transaction", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  payPeriod: varchar("pay_period", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const datapoints = balanceSchema.table("datapoint", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export type TransactionRow = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
