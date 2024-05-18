import { ExitCodes } from "../config/Errors";
import { exitProcess } from "./Process";

import fs from "fs";
// Function to read the text file and return its contents as a string
export function readTextFile(filePath: string): string {
	try {
		const text = fs.readFileSync(filePath, "utf8");
		return text;
	} catch (error) {
		console.log(`🔴 Couldn't read file => ${filePath}`);
		console.log(error);
		
		
		exitProcess(ExitCodes.ERROR_COULDNT_READ_FILE, { filePath });
		return "";
	}
}
