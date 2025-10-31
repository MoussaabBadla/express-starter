import { CorsOptions } from "cors";
import { ORIGINS, FRONT_URL, ADMIN_URL } from "../config/Env";
import { globalLogger } from "./Logger";

/**
 * Parse allowed origins from environment variable
 */
const getAllowedOrigins = (): string[] => {
    const origins = ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
    // Always include frontend and admin URLs
    const defaultOrigins = [FRONT_URL, ADMIN_URL];
    return [...new Set([...origins, ...defaultOrigins])];
};

export const ProductionCors: CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            callback(null, true);
        } else {
            globalLogger.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error("Request's origin not accepted by CORS policy."));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
};

export const DevCors: CorsOptions = {
    origin: (_origin, callback) => {
        // In development, allow all origins
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};
