// import path from "path";

import path from "path";
import { log } from "../utils/Function";

/**
 * @description Checks the value of an environment field and logs the result.
 *
 * @param {string} envField - The name of the environment field to check.
 * @param {string} replacedBy - The value to replace if the environment field is undefined.
 * @returns {string} The value of the environment field or the replacement value if undefined.
 */
function CheckEnv(envField: string, replacedBy: string): string {
	const value = process.env[envField];
	
	if (value) {
		log(`🟢 Checking env field => '${envField}' : ${process.env[envField]}`);
		return value;
	}
	log(`🟡 Checking env field => '${envField}' : 'undefined' Replaced by => ${replacedBy}`);
	return replacedBy;
}

log("---------------------------- Replaceable ENV ----------------------------");

/**
 * @description The current working directory of the project.
 */
export const CWD = process.cwd();
log(`🔵 The project started from ${CWD}`);

/**
 * @description Flag indicating if the application is in development mode.
 * @default true
 */
export const InDev = CheckEnv("IN_PROD", "false") === "false";

/**
 * @description The default port number if the 'BACK_PORT' environment variable is not set.
 * @default "8080"
 */
export const PORT = CheckEnv("BACK_PORT", "8080");


/**
 * @description The domain name of the platform. If 'DOMAIN' is not set, it defaults to 'storming-ai.app'
 * @default "storming-ai.app"
 * 
 */
export const DOMAIN = CheckEnv("DOMAIN", "storming-ai.app");

/**
 * @description The URL of the backend. If 'BACK_URL' is not set, it defaults to 'http://localhost:PORT' in development mode and 'https://storming-ai.app' in production mode.
 * @default value (InDev ? "http://localhost:" + PORT : "https://back.{DOMAIN}")
 */
export const BACK_URL = CheckEnv("BACK_URL", InDev ? "http://localhost:" + PORT : `https://back.${DOMAIN}`);

/**
 * @description The URL of the frontend app. If 'FRONT_URL' is not set, it defaults to 'http://localhost:PORT' in development mode and 'https://${DOMAIN}' in production mode.
 * @default value (InDev ? "http://localhost:" + PORT : "https://{DOMAIN}")
 */
export const FRONT_URL = CheckEnv("FRONT_URL", InDev ? "http://localhost:" + PORT : `https://${DOMAIN}`);

/**
 * @description The URL of the frontend of the admin app. If 'ADMIN_URL' is not set, it defaults to 'http://localhost:PORT' in development mode and 'https://admin.${DOMAIN}' in production mode.
 * @default value (InDev ? "http://localhost:" + PORT : "https://{DOMAIN}")
 */
export const ADMIN_URL = CheckEnv("ADMIN_URL", InDev ? "http://localhost:" + PORT : `https://admin.${DOMAIN}`);

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
 * @description The URL of the main page of the platform.
 * @default "FRONT_URL"
 */
export const MAIN_URL = CheckEnv("MAIN_URL", "FRONT_URL");




/**
 * @description The developer's email address.
 * @default "badlamoussaab@gmail.com"
 */
export const DEV_Email = CheckEnv("DEV_Email", "badlamoussaab@gmail.com");

/**
 * @description The port used for email communication.
 * @default "465"
 */
export const EmailPort = CheckEnv("BACK_EmailPort", "465");

/**
 * @description The host used for email communication.
 * @default "smtp.gmail.com"
 */
export const EmailHost = CheckEnv("BACK_EmailHost", "smtp.gmail.com");
export const PROJECT_Name = CheckEnv("PROJECT_Name", "Storming AI");


/**
 * @description The root directory where log files are stored.
 * @default value path.join(CWD, "logs")
 */
export const LogsRoot = CheckEnv("LogsRoot", path.join(CWD, "logs"));

/**
 * @description The root directory where static files are stored.
 * @default value path.join(CWD, "tmp")
 */
export const StaticRoot = CheckEnv("STATIC", path.join(CWD, "tmp"));

/**
 * @description The cache age of static files
 * @default 2592000
 * aka 30 days
 */
export const Static_Cache_Age = Number(CheckEnv("Static_Cache_Age", "2592000"));

/**
 * @description The maximum duration (in seconds) before the application times out and exits.
 */
export const TimeOutExit = Number(CheckEnv("TimeOutExit", "0"));

export const NODE_ENV = CheckEnv("NODE_ENV", "development");
export const InTest = NODE_ENV === "test";
export const ORIGINS = CheckEnv("ORIGINS", FRONT_URL);

/**
 * @description The maximum file size (in bytes) that can be uploaded.
 * @default 5242880
 * aka 5MB
 */
export const sizeLimit = Number(CheckEnv("BACK_SIZE_LIMIT", "5242880"));

export const GENERATION_API_URL = CheckEnv("GENERATION_API_URL", "http://127.0.0.1:8000");

log("--------------------------------------------------------\n");
