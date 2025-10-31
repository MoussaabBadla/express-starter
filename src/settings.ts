import mongoose from "mongoose";
import { MONGODB_NAME, MONGODB_URI, InDev } from "./config/Env";
import { exitProcess } from "./utils/Process";
import { ExitCodes } from "./config/Errors";
import { setTimeout } from "timers/promises";
import { globalLogger } from "./utils/Logger";
import { redisClient, disconnectRedis } from "./config/redis";

if (InDev) mongoose.set("debug", true);

/**
 * The MongoDB database connection instance.
 * @type {mongoose.Connection}
 */
export const db = mongoose
	.connect(MONGODB_URI, { dbName:MONGODB_NAME })
	.then(async () => {
		globalLogger.info(`🗄️  ==> '${MONGODB_NAME}' DB is Connected.`);
	})
	.catch((err) => {
		globalLogger.error("MongoDB connection error", err);
	});

mongoose.connection.on("error", (err) => {
	globalLogger.error("MongoDB connection error", err);
});

/**
 * System class for managing application startup and error handling.
 */
export default class System {
	/**
	 * ProcessError method for exiting the application after a specified time.
	 * @param {number} second - The time in seconds after which the process will be terminated.
	 */
	static async ProcessError(second: number) {
		// Timeout exit
		setTimeout(second * 1000).then(() => {
			exitProcess(ExitCodes.ERROR_GENERIC, { error: "Manual termination after timeout" });
		});
	}

	/**
	 * Start method for initializing the application and dependencies.
	 */
	static async Start() {
		await db;
		await redisClient.ping();
		globalLogger.info("🔴 Redis connection verified.");
	}

	static async Stop() {
		await disconnectRedis();
		await mongoose.disconnect();
		globalLogger.info("🛑 All connections closed successfully.");
	}

}
