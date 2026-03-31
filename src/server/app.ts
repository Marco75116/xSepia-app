import { Elysia } from "elysia";
import { accountRoutes } from "@/server/routes/account";
import { healthRoutes } from "@/server/routes/health";
import { swapRoutes } from "@/server/routes/swap";

export const app = new Elysia({ prefix: "/api" })
  .use(healthRoutes)
  .use(accountRoutes)
  .use(swapRoutes);

export type App = typeof app;
