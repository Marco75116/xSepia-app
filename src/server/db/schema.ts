import { relations } from "drizzle-orm";
import { integer, numeric, pgTable, text } from "drizzle-orm/pg-core";

export const vault = pgTable("vault", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  chainId: integer("chain_id").notNull(),
  saltIndex: integer("salt_index").notNull().default(0),
  smartAccountAddress: text("smart_account_address"),
  strategy: text("strategy").notNull(),
  dcaFrequency: text("dca_frequency"),
  dcaAmount: numeric("dca_amount"),
  createdAt: numeric("created_at").notNull(),
  updatedAt: numeric("updated_at").notNull(),
});

export const vaultComposition = pgTable("vault_composition", {
  id: text("id").primaryKey(),
  vaultId: text("vault_id").notNull(),
  ticker: text("ticker").notNull(),
  tokenAddress: text("token_address").notNull(),
  weight: integer("weight").notNull(),
  chainId: integer("chain_id").notNull(),
  createdAt: numeric("created_at").notNull(),
});

export const buyOrder = pgTable("buy_order", {
  id: text("id").primaryKey(),
  vaultId: text("vault_id").notNull(),
  ticker: text("ticker").notNull(),
  tokenAddress: text("token_address").notNull(),
  sellAmountUsdc: numeric("sell_amount_usdc").notNull(),
  orderUid: text("order_uid"),
  status: text("status").notNull(),
  error: text("error"),
  chainId: integer("chain_id").notNull(),
  createdAt: numeric("created_at").notNull(),
});

export const withdrawOrder = pgTable("withdraw_order", {
  id: text("id").primaryKey(),
  vaultId: text("vault_id").notNull(),
  ticker: text("ticker").notNull(),
  tokenAddress: text("token_address").notNull(),
  amount: numeric("amount").notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull(),
  chainId: integer("chain_id").notNull(),
  createdAt: numeric("created_at").notNull(),
});

export const vaultRelations = relations(vault, ({ many }) => ({
  compositions: many(vaultComposition),
  buyOrders: many(buyOrder),
  withdrawOrders: many(withdrawOrder),
}));

export const vaultCompositionRelations = relations(
  vaultComposition,
  ({ one }) => ({
    vault: one(vault, {
      fields: [vaultComposition.vaultId],
      references: [vault.id],
    }),
  }),
);

export const buyOrderRelations = relations(buyOrder, ({ one }) => ({
  vault: one(vault, {
    fields: [buyOrder.vaultId],
    references: [vault.id],
  }),
}));

export const withdrawOrderRelations = relations(withdrawOrder, ({ one }) => ({
  vault: one(vault, {
    fields: [withdrawOrder.vaultId],
    references: [vault.id],
  }),
}));
