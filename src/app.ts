// Import necessary configuration and modules
import {
  PORT,
  InDev,
  StaticRoot,
  MediaRoute,
  Static_Cache_Age,
} from "./config/Env";
import "./utils/Events";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import cors from "cors";
import filesRoutes from "./routes/file.router";
import { errorMiddleware } from "./utils/Errors";
import { DevCors, ProductionCors } from "./utils/Cors";
import { ErrorResponse } from "./utils/Response";
import { HttpCodes } from "./config/Errors";
import System from "./settings";
import SetRouters from "./routes/index";
import { apiLimiter } from "./middleware/rateLimit";
import { globalLogger } from "./utils/Logger";


/**
 * The Express application instance.
 * @type {express.Application}
 *
 *
 *
 */
export const app = express();

/**
 * Security middleware - Helmet for security headers
 */
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "https:"],
		},
	},
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: { policy: "cross-origin" },
}));

/**
 * NoSQL injection protection
 */
app.use(mongoSanitize({
	replaceWith: '_',
	onSanitize: ({ key }) => {
		globalLogger.warn(`Potential NoSQL injection attempt detected in ${key}`);
	},
}));

/**
 * Enable the Express application to trust the first proxy.
 * IMPORTANT: Must be set BEFORE rate limiters to get correct client IPs
 */
app.set("trust proxy", 1);

/**
 * Enable CORS middleware based on the environment.
 */
app.use(InDev ? cors(DevCors) : cors(ProductionCors));

/**
 * Parse cookies in the Express application.
 */
app.use(cookieParser());

/**
 * Correlation ID middleware for request tracking
 * Generates unique ID for each request for debugging and monitoring
 */
import { correlationIdMiddleware } from "./middleware/correlationId";
app.use(correlationIdMiddleware);

/**
 * HTTP Request logging with correlation ID
 */
import { requestLoggerMiddleware } from "./middleware/requestLogger";
app.use(requestLoggerMiddleware);

/**
 * Parse incoming request bodies as URL-encoded data with size limit.
 */
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

/**
 * Parse incoming request bodies as JSON with size limit.
 */
app.use(express.json({ limit: '10mb' }));

/**
 * Enable file uploads handling through the `filesRoutes` router.
 * IMPORTANT: Must be registered BEFORE static file serving so API routes take precedence
 */
if (StaticRoot) app.use(MediaRoute, filesRoutes);

/**
 * Configure serving static files from the specified root directory if `StaticRoot` is set.
 * IMPORTANT: Must be registered AFTER API routes so static files are served only for GET requests
 */
if (StaticRoot)
  app.use(MediaRoute, express.static(StaticRoot, { maxAge: Static_Cache_Age }));

/**
 * Apply general API rate limiting
 */
app.use(apiLimiter);

/**
 * Set up general routes using the `SetRouters` function.
 */

SetRouters(app);

/**
 * Route to handle requests that do not match any defined routes, returning a 404 response.
 */
app.use("*", (_req, res) =>
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

let server: any;

if (process.env.NODE_ENV !== "test") {
  System.Start().then(async () => {
    server = app.listen(PORT, () => {
      // Display server and backend URLs upon successful server start.
      const port_msg = `Server running on port: ${PORT}.`;
      const url_msg = `The backend is open in:  http://localhost:${PORT} .`;
      const max_length = Math.max(url_msg.length, port_msg.length) + 4;
      const n = Math.floor((max_length - port_msg.length) / 2);
      const m = Math.floor((max_length - url_msg.length) / 2);

      globalLogger.info(" " + "-".repeat(max_length));
      globalLogger.info(`|${" ".repeat(n)}${port_msg}${" ".repeat(n)}|`);
      globalLogger.info(`|${" ".repeat(m)}${url_msg}${" ".repeat(m)}|`);
      globalLogger.info(" " + "-".repeat(max_length));
    });
  });
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string) {
  globalLogger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      globalLogger.info("HTTP server closed");
    });
  }

  try {
    // Close database and Redis connections
    await System.Stop();
    globalLogger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    globalLogger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  globalLogger.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  globalLogger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  gracefulShutdown("unhandledRejection");
});

export async function StopServer() {
  await System.Stop();
}


