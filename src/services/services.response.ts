import assert from "assert";


export class SuccessResponseC implements SuccessResponseI {
	status: string;
	data: unknown;
	message: string;
	code: number;
	constructor(status : string , data: unknown, message: string , code: number)   
	{
		this.status = status;
		this.data = data;
		this.message = message;
		this.code = code;
		assert(this.code < 300, "Success code must be less than 300");

	}
}

export class ErrorResponseC implements ErrorResponseI {
	status: string;
	code: number;
    message: string;
	error: unknown;
	constructor(message: string, code: number, error: unknown) {
		this.status = "error";
		this.code = code;
        this.message = message;
		this.error = error;
		assert(this.code >= 300, "Error code must be greater than 300");
	}
}