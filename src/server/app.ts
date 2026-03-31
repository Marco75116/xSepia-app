import { Elysia } from "elysia";
import { healthRoutes } from "@/server/routes/health";

export const app = new Elysia({ prefix: "/api" }).use(healthRoutes);

export type App = typeof app;
