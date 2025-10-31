import Joi from "joi";
import { log } from "../utils/Function";

/**
 * Environment variable validation schema
 */
const envSchema = Joi.object({
	// Node environment
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),

	// Server configuration
	BACK_PORT: Joi.number().port().default(8080),
	MAIN_URL: Joi.string().uri().optional(),

	// Database configuration
	BACK_MONGODB_URI: Joi.string().required(),
	BACK_MONGODB_NAME: Joi.string().required(),

	// Authentication
	BACK_SECRET: Joi.string().min(32).required(),

	// Email configuration
	BACK_EmailHost: Joi.string().default("smtp.gmail.com"),
	BACK_EmailPort: Joi.number().port().default(465),
	BACK_EmailUser: Joi.string().required(),
	BACK_EmailPass: Joi.string().required(),
	DEV_Email: Joi.string().email().optional(),

	// Static files
	STATIC: Joi.string().optional(),
	LOGS: Joi.string().optional(),

	// Redis configuration
	REDIS_HOST: Joi.string().default("localhost"),
	REDIS_PORT: Joi.number().port().default(6379),
	REDIS_PASSWORD: Joi.string().allow("").optional(),
	REDIS_DB: Joi.number().min(0).max(15).default(0),

	// Cloudinary configuration (optional)
	CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
	CLOUDINARY_API_KEY: Joi.string().optional(),
	CLOUDINARY_API_SECRET: Joi.string().optional(),

	// CORS origins
	ORIGINS: Joi.string().optional(),
	FRONT_URL: Joi.string().uri().optional(),
	ADMIN_URL: Joi.string().uri().optional(),
	DOMAIN: Joi.string().optional(),

	// Other configuration
	PROJECT_Name: Joi.string().optional(),
	Static_Cache_Age: Joi.number().optional(),
	TimeOutExit: Joi.number().optional(),
	BACK_SIZE_LIMIT: Joi.number().optional(),
	GENERATION_API_URL: Joi.string().uri().optional(),
	IN_PROD: Joi.string().valid("true", "false").optional(),
	BACK_URL: Joi.string().uri().optional(),
}).unknown(true); // Allow unknown env vars

/**
 * Validate environment variables
 * @throws Error if validation fails
 */
export function validateEnv(): void {
	const { error } = envSchema.validate(process.env, {
		abortEarly: false, // Show all errors
		stripUnknown: false, // Keep unknown env vars
	});

	if (error) {
		const errorMessages = error.details.map((detail) => {
			return `  - ${detail.path.join(".")}: ${detail.message}`;
		}).join("\n");

		console.error("❌ Environment variable validation failed:");
		console.error(errorMessages);
		process.exit(1);
	}

	log("✅ Environment variables validated successfully");
}
