import { Application } from "express";
import indexRouter from "./index.router";
import authRouter from "./auth.router";
import healthRouter from "./health.router";
import swaggerRouter from "./swagger.router";

export default function SetRouters(app: Application) {
  app.use("/api-docs", swaggerRouter);
  app.use("/health", healthRouter);
  app.use("/", indexRouter);
  app.use("/auth", authRouter);
}
