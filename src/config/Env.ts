import path from "path";
import { validateEnv } from "./envValidation";

/**
 * Validate environment variables on module load
 * This ensures all required variables are present before the app starts
 */
validateEnv();

/**
 * Helper function to get env var with default value
 */
const getEnv = (key: string, defaultValue: string): string => {
	return process.env[key] || defaultValue;
};

// ============================================
// REQUIRED Environment Variables (validated by Joi)
// ============================================

/**
 * MongoDB connection URI (REQUIRED)
 */
export const MONGODB_URI = process.env.BACK_MONGODB_URI as string;

/**
 * MongoDB database name (REQUIRED)
 */
export const MONGODB_NAME = process.env.BACK_MONGODB_NAME as string;

/**
 * JWT secret key for token signing (REQUIRED, min 32 chars)
 */
export const JWT_SECRET = process.env.BACK_SECRET as string;

/**
 * Email username for sending emails (REQUIRED)
 */
export const EmailUser = process.env.BACK_EmailUser as string;

/**
 * Email password for authentication (REQUIRED)
 */
export const EmailPass = process.env.BACK_EmailPass as string;

// ============================================
// OPTIONAL Environment Variables (with defaults)
// ============================================

/**
 * The current working directory of the project.
 */
export const CWD = process.cwd();

/**
 * Flag indicating if the application is in development mode.
 * @default true
 */
export const InDev = getEnv("IN_PROD", "false") === "false";

/**
 * The default port number if the 'BACK_PORT' environment variable is not set.
 * @default "8080"
 */
export const PORT = getEnv("BACK_PORT", "8080");


/**
 * The domain name of the platform.
 * @default "storming-ai.app"
 */
export const DOMAIN = getEnv("DOMAIN", "storming-ai.app");

/**
 * The URL of the backend.
 * @default value (InDev ? "http://localhost:" + PORT : "https://back.{DOMAIN}")
 */
export const BACK_URL = getEnv("BACK_URL", InDev ? "http://localhost:" + PORT : `https://back.${DOMAIN}`);

/**
 * The URL of the frontend app.
 * @default value (InDev ? "http://localhost:" + PORT : "https://{DOMAIN}")
 */
export const FRONT_URL = getEnv("FRONT_URL", InDev ? "http://localhost:" + PORT : `https://${DOMAIN}`);

/**
 * The URL of the frontend of the admin app.
 * @default value (InDev ? "http://localhost:" + PORT : "https://admin.${DOMAIN}")
 */
export const ADMIN_URL = getEnv("ADMIN_URL", InDev ? "http://localhost:" + PORT : `https://admin.${DOMAIN}`);

/**
 * @description The route used for serving media files.
 * @default "/files"
 */
export const MediaRoute = "/media";

/**
 * @description The URL for serving media files.
 * @default `${BACK_URL}${MediaRoute}`
 */
export const MediaURL = `${BACK_URL}${MediaRoute}`;

/**
 * The URL of the main page of the platform.
 * @default FRONT_URL
 */
export const MAIN_URL = getEnv("MAIN_URL", FRONT_URL);

/**
 * The developer's email address.
 * @default "badlamoussaab@gmail.com"
 */
export const DEV_Email = getEnv("DEV_Email", "badlamoussaab@gmail.com");

/**
 * The port used for email communication.
 * @default "465"
 */
export const EmailPort = getEnv("BACK_EmailPort", "465");

/**
 * The host used for email communication.
 * @default "smtp.gmail.com"
 */
export const EmailHost = getEnv("BACK_EmailHost", "smtp.gmail.com");

/**
 * Project name
 * @default "Storming AI"
 */
export const PROJECT_Name = getEnv("PROJECT_Name", "Storming AI");

/**
 * The root directory where log files are stored.
 * @default path.join(CWD, "logs")
 */
export const LogsRoot = getEnv("LogsRoot", path.join(CWD, "logs"));

/**
 * The root directory where static files are stored.
 * @default path.join(CWD, "tmp")
 */
export const StaticRoot = getEnv("STATIC", path.join(CWD, "tmp"));

/**
 * The cache age of static files
 * @default 2592000 (30 days)
 */
export const Static_Cache_Age = Number(getEnv("Static_Cache_Age", "2592000"));

/**
 * The maximum duration (in seconds) before the application times out and exits.
 */
export const TimeOutExit = Number(getEnv("TimeOutExit", "0"));

/**
 * Node environment
 */
export const NODE_ENV = getEnv("NODE_ENV", "development");

/**
 * Flag indicating if running in test mode
 */
export const InTest = NODE_ENV === "test";

/**
 * Allowed CORS origins
 */
export const ORIGINS = getEnv("ORIGINS", FRONT_URL);

/**
 * The maximum file size (in bytes) that can be uploaded.
 * @default 5242880 (5MB)
 */
export const sizeLimit = Number(getEnv("BACK_SIZE_LIMIT", "5242880"));

/**
 * Generation API URL
 */
export const GENERATION_API_URL = getEnv("GENERATION_API_URL", "http://127.0.0.1:8000");
