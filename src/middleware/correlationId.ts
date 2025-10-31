import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Correlation ID middleware
 * Generates or extracts a correlation ID for request tracking
 *
 * Usage:
 * - Automatically generates unique ID for each request
 * - Accepts existing ID from X-Correlation-ID header
 * - Adds ID to request object and response headers
 * - Enables request tracking across services
 */

export const correlationIdMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Check if correlation ID exists in request headers
	const existingId = req.headers["x-correlation-id"] || req.headers["x-request-id"];

	// Use existing ID or generate new one
	const correlationId = (Array.isArray(existingId) ? existingId[0] : existingId) || randomUUID();

	// Add to request object
	(req as any).correlationId = correlationId;

	// Add to response headers for client
	res.setHeader("X-Correlation-ID", correlationId);
	res.setHeader("X-Request-ID", correlationId);

	next();
};

/**
 * Get correlation ID from request
 * @param req - Express request object
 * @returns Correlation ID string
 */
export const getCorrelationId = (req: Request): string => {
	return (req as any).correlationId || "unknown";
};
