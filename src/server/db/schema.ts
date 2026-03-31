import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const vaults = pgTable("vaults", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  smartAccountAddress: text("smart_account_address"),
  strategy: text("strategy", { enum: ["manual", "dca"] }).notNull(),
  dcaFrequency: text("dca_frequency", {
    enum: ["daily", "weekly", "monthly"],
  }),
  dcaAmount: numeric("dca_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vaultCompositions = pgTable("vault_compositions", {
  id: uuid("id").primaryKey().defaultRandom(),
  vaultId: uuid("vault_id")
    .notNull()
    .references(() => vaults.id, { onDelete: "cascade" }),
  ticker: text("ticker").notNull(),
  tokenAddress: text("token_address").notNull(),
  weight: integer("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
