import { Elysia } from "elysia";
import { accountRoutes } from "@/server/routes/account";
import { healthRoutes } from "@/server/routes/health";
import { swapRoutes } from "@/server/routes/swap";
import { vaultRoutes } from "@/server/routes/vault";

export const app = new Elysia({ prefix: "/api" })
  .use(healthRoutes)
  .use(accountRoutes)
  .use(swapRoutes)
  .use(vaultRoutes);

export type App = typeof app;
