// Import necessary configuration and modules
import {
  PORT,
  InDev,
  StaticRoot,
  MediaRoute,
  Static_Cache_Age,
} from "./config/Env";
import "./utils/Events";
import "./config/CheckableEnv";
import express from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import filesRoutes from "./routes/file.router";
import { errorMiddleware } from "./utils/Errors";
import { DevCors, ProductionCors } from "./utils/Cors";
import { ErrorResponse } from "./utils/Response";
import { HttpCodes } from "./config/Errors";
import System from "./settings";
import SetRouters from "./routes/index";

// import { ErrorResponse } from "utils/Response";
// import { errorMiddleware } from "utils/Errors";
// import SetRouters from "./routers";

/**
 * The Express application instance.
 * @type {express.Application}
 *
 *
 *
 */
export const app = express();

/**
 * Configure serving static files from the specified root directory if `StaticRoot` is set.
 */
if (StaticRoot)
  app.use(MediaRoute, express.static(StaticRoot, { maxAge: Static_Cache_Age }));

/**
 * Enable CORS middleware based on the environment.
 */
app.use(InDev ? cors(DevCors) : cors(ProductionCors));

/**
 * Parse cookies in the Express application.
 */
app.use(cookieParser());
/**
 * Parse incoming request bodies as URL-encoded data.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Enable file uploads handling through the `filesRoutes` router.
 */

if (StaticRoot) app.use(MediaRoute, filesRoutes);

/**
 * Parse incoming request bodies as JSON.
 */
app.use(express.json());

/**
 * Set up general routes using the `SetRouters` function.
 */

SetRouters(app);

/**
 * Enable the Express application to trust the first proxy.
 */



app.set("trust proxy", true);

/**
 * Route to handle requests that do not match any defined routes, returning a 404 response.
 */
app.use("*", (req, res, next) =>
  ErrorResponse(
    res,
    HttpCodes.NotImplemented.code,
    HttpCodes.NotImplemented.message
  )
);

/**
 * Middleware for handling errors throughout the application.
 */
app.use(errorMiddleware);

/**
 * Start the MongoDB connection and then listen on the specified PORT.
 */

if (process.env.NODE_ENV !== "test") {
  System.Start().then(async () => {
    app.listen(PORT, () => {
      // Display server and backend URLs upon successful server start.
      const port_msg = `Server running on port: ${PORT}.`;
      const url_msg = `The backend is open in:  http://localhost:${PORT} .`;
      const max_length = Math.max(url_msg.length, port_msg.length) + 4;
      const n = Math.floor((max_length - port_msg.length) / 2);
      const m = Math.floor((max_length - url_msg.length) / 2);

      console.log(" " + "-".repeat(max_length));
      console.log(`|${" ".repeat(n)}${port_msg}${" ".repeat(n)}|`);
      console.log(`|${" ".repeat(m)}${url_msg}${" ".repeat(m)}|`);
      console.log(" " + "-".repeat(max_length));
    });
  });
}

export async function StopServer() {
  await System.Stop();
}


