import { Router, Request, Response } from "express";
import { redisClient } from "../config/redis";
import mongoose from "mongoose";

const healthRouter = Router();

/**
 * GET /health
 * @tags Health
 * @summary Overall health check
 * @description Check the health status of the application, MongoDB, and Redis.
 * @returns {HealthResponse} 200 - All services are healthy
 * @returns {HealthResponse} 503 - One or more services are down
 */
healthRouter.get("/", async (_req: Request, res: Response) => {
	const health = {
		uptime: process.uptime(),
		timestamp: Date.now(),
		status: "OK",
		checks: {
			mongodb: "DOWN",
			redis: "DOWN",
		},
	};

	try {
		// Check MongoDB connection
		if (mongoose.connection.readyState === 1) {
			health.checks.mongodb = "UP";
		}

		// Check Redis connection
		try {
			await redisClient.ping();
			health.checks.redis = "UP";
		} catch (redisError) {
			health.checks.redis = "DOWN";
		}

		// If any service is down, return 503
		if (health.checks.mongodb !== "UP" || health.checks.redis !== "UP") {
			health.status = "DEGRADED";
			return res.status(503).json(health);
		}

		return res.status(200).json(health);
	} catch (error) {
		health.status = "ERROR";
		return res.status(503).json(health);
	}
});

/**
 * GET /health/ready
 * @tags Health
 * @summary Readiness probe
 * @description Check if the application is ready to serve traffic (Kubernetes-ready).
 * @returns {object} 200 - Application is ready
 * @returns {object} 503 - Application is not ready
 */
healthRouter.get("/ready", async (_req: Request, res: Response) => {
	try {
		// Check if MongoDB is ready
		const mongoReady = mongoose.connection.readyState === 1;

		// Check if Redis is ready
		let redisReady = false;
		try {
			await redisClient.ping();
			redisReady = true;
		} catch {
			redisReady = false;
		}

		if (mongoReady && redisReady) {
			return res.status(200).json({ status: "ready" });
		}

		return res.status(503).json({ status: "not ready" });
	} catch {
		return res.status(503).json({ status: "not ready" });
	}
});

/**
 * GET /health/live
 * @tags Health
 * @summary Liveness probe
 * @description Check if the application is alive (Kubernetes-ready).
 * @returns {object} 200 - Application is alive
 */
healthRouter.get("/live", (_req: Request, res: Response) => {
	res.status(200).json({ status: "alive" });
});

export default healthRouter;
