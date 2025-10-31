import { Request, Response, NextFunction } from "express";
import { getRequestLogger } from "../utils/RequestLogger";

/**
 * HTTP Request logging middleware
 * Logs all incoming requests with correlation ID
 */
export const requestLoggerMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const logger = getRequestLogger(req);
	const startTime = Date.now();

	// Log incoming request
	logger.http(`${req.method} ${req.path}`, {
		method: req.method,
		path: req.path,
		query: req.query,
		ip: req.ip,
		userAgent: req.get("user-agent"),
	});

	// Log response when finished
	res.on("finish", () => {
		const duration = Date.now() - startTime;
		logger.http(`${req.method} ${req.path} - ${res.statusCode}`, {
			method: req.method,
			path: req.path,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
		});
	});

	next();
};
