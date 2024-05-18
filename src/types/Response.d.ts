

interface ResponseI {
	status: string;
	message: string;
	data?: unknown;
	error?: unknown;
	code?: number;
}


type ResponseT = ErrorResponseI | SuccessResponseI;



interface SuccessResponseI {
	status: string;
	data: unknown;
	message: string;
}

type SuccessResponseT = SuccessResponseI;



interface ErrorResponseI {
	status: string;
	message: string;
	code: number;
	error: unknown;
}


type ErrorResponseT = ErrorResponseI;


