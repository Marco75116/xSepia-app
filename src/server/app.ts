import { Elysia } from "elysia";
import { accountRoutes } from "@/server/routes/account";
import { healthRoutes } from "@/server/routes/health";
import { signalRoutes } from "@/server/routes/signals";
import { swapRoutes } from "@/server/routes/swap";
import { vaultRoutes } from "@/server/routes/vault";
import { withdrawRoutes } from "@/server/routes/withdraw";

export const app = new Elysia({ prefix: "/api" })
  .use(healthRoutes)
  .use(accountRoutes)
  .use(swapRoutes)
  .use(vaultRoutes)
  .use(withdrawRoutes)
  .use(signalRoutes);

export type App = typeof app;
