import mongoose from "mongoose";
import { MONGODB_NAME, MONGODB_URI } from "./config/CheckableEnv";
import { exitProcess } from "./utils/Process";
import { ExitCodes } from "./config/Errors";
import { setTimeout } from "timers/promises";
import { InDev } from "./config/Env";
import { log } from "./utils/Function";

if (InDev) mongoose.set("debug", true);

/**
 * The MongoDB database connection instance.
 * @type {mongoose.Connection}
 */
export const db = mongoose
	.connect(MONGODB_URI, { dbName:MONGODB_NAME })
	.then(async () => {
			
		log(`🗄️  ==> '${MONGODB_NAME}' DB is Connected.`);
	})
	.catch((err) => {
		console.log(err);
		
	});
mongoose.connection.on("error", (err) => {});

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
		
	}

	static async Stop() {
		await mongoose.disconnect();
	}

}
