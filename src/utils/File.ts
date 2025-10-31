import { ExitCodes } from "../config/Errors";
import { exitProcess } from "./Process";
import { globalLogger } from "./Logger";

import fs from "fs";
// Function to read the text file and return its contents as a string
export function readTextFile(filePath: string): string {
	try {
		const text = fs.readFileSync(filePath, "utf8");
		return text;
	} catch (error) {
		globalLogger.error(`🔴 Couldn't read file => ${filePath}`);
		globalLogger.error(String(error));


		exitProcess(ExitCodes.ERROR_COULDNT_READ_FILE, { filePath });
		return "";
	}
}
