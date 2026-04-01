import { relations } from "drizzle-orm";
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

export const buyOrders = pgTable("buy_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  vaultId: uuid("vault_id")
    .notNull()
    .references(() => vaults.id, { onDelete: "cascade" }),
  ticker: text("ticker").notNull(),
  tokenAddress: text("token_address").notNull(),
  sellAmountUsdc: numeric("sell_amount_usdc").notNull(),
  orderUid: text("order_uid"),
  status: text("status", {
    enum: ["submitted", "filled", "failed"],
  }).notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vaultsRelations = relations(vaults, ({ many }) => ({
  compositions: many(vaultCompositions),
  buyOrders: many(buyOrders),
}));

export const vaultCompositionsRelations = relations(
  vaultCompositions,
  ({ one }) => ({
    vault: one(vaults, {
      fields: [vaultCompositions.vaultId],
      references: [vaults.id],
    }),
  }),
);

export const buyOrdersRelations = relations(buyOrders, ({ one }) => ({
  vault: one(vaults, {
    fields: [buyOrders.vaultId],
    references: [vaults.id],
  }),
}));
