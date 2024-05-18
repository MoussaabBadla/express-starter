import { Application } from "express";
import indexRouter from "./index.router";
import authRouter from "./auth.router";
export default function SetRouters(app: Application) {
  app.use("/", indexRouter);
  app.use("/auth", authRouter);

}
