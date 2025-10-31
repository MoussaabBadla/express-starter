import { Request } from "express";
import { globalLogger } from "./Logger";
import { getCorrelationId } from "../middleware/correlationId";

/**
 * Request-aware logging utilities
 * Automatically includes correlation ID from request context
 */

export class RequestLogger {
	private correlationId: string;

	constructor(req: Request) {
		this.correlationId = getCorrelationId(req);
	}

	private addMeta(meta?: any) {
		return {
			correlationId: this.correlationId,
			...meta,
		};
	}

	error(message: string, meta?: any) {
		globalLogger.error(message, this.addMeta(meta));
	}

	warn(message: string, meta?: any) {
		globalLogger.warn(message, this.addMeta(meta));
	}

	info(message: string, meta?: any) {
		globalLogger.info(message, this.addMeta(meta));
	}

	http(message: string, meta?: any) {
		globalLogger.http(message, this.addMeta(meta));
	}

	verbose(message: string, meta?: any) {
		globalLogger.verbose(message, this.addMeta(meta));
	}

	debug(message: string, meta?: any) {
		globalLogger.debug(message, this.addMeta(meta));
	}

	silly(message: string, meta?: any) {
		globalLogger.silly(message, this.addMeta(meta));
	}
}

/**
 * Get a logger instance with correlation ID from request
 * @param req - Express request object
 * @returns RequestLogger instance
 */
export const getRequestLogger = (req: Request): RequestLogger => {
	return new RequestLogger(req);
};
