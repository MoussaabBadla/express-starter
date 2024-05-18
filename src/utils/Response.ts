import { Error } from "mongoose";
import { HttpCodes } from "../config/Errors";
import { Response as ExpressResponse } from "express";
import { MongoError } from "mongodb";
import { assert } from "console";
// Helper function to extract the duplicate key from the error message
function extractDuplicateKey(errorMessage: string): string | null {
	const match = errorMessage.match(/index:\s+([^\s]+)/);
	return match ? match[1] : "unknown";
}
export function ErrorResponse(res: ExpressResponse, code: number, errorMessage: string, error?: unknown) {
	assert(code >= 300, "Error code must be greater than 300");
	let response: ErrorResponseI =
		error && error instanceof Error.ValidationError && error.errors
			? {
					status: "error",
					message: Object.values(error.errors)
						.map((err) => err.message)
						.join(","),
					code: HttpCodes.BadRequest.code,
					error,
			  }
			: error && error instanceof MongoError && error.code === 11000
			? {
					status: "error",
					message: `These keys already exist [${extractDuplicateKey(error.message)}], it's not allowed to use duplicate keys`,
					code: HttpCodes.BadRequest.code,
					error,
			  }
			: {
					status: "error",
					message: errorMessage,
					code: code,
					error,
			  };
			  
if(code === HttpCodes.NotFound.code){
	response={
		status: "error",
		message: `${errorMessage}`,
		code: HttpCodes.NotFound.code,
		error,
  }
}			  
	res.status(response.code).send(response);
}
export function SuccessResponse(res: ExpressResponse, code: number, data: unknown, message = "Successful", status = "success") {
	assert(code < 300, "Success code must be less than 300");
	const response: SuccessResponseI = {
		status,
		data,
		message,
	};
	res.status(code).send(response);
}



