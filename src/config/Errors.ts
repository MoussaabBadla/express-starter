export const ExitCodes: IErrors<IExitCodes> = {
	SUCCESS: { code: 0, message: "Success", type: "SUCCESS" },
	ERROR_GENERIC: { code: 1, message: "Generic error '{error}'", type: "ERROR_GENERIC" },
	ERROR_INVALID_INPUT: { code: 2, message: "Invalid input '{input}'", type: "ERROR_INVALID_INPUT" },
	ERROR_FILE_NOT_FOUND: { code: 3, message: "File not found '{fileName}'", type: "ERROR_FILE_NOT_FOUND" },
	ERROR_DATABASE_CONNECTION: {
		code: 4,
		message: "Failed to connect to the database",
		type: "ERROR_DATABASE_CONNECTION",
	},
	ERROR_DATABASE_DISCONNECTED: {
		code: 5,
		message: "Database disconnected for a fail {error}",
		type: "ERROR_DATABASE_DISCONNECTED",
	},
	ERROR_COULDNT_READ_FILE: { code: 6, message: "Failed to read a file {filePath}", type: "ERROR_COULDNT_READ_FILE" },
	ENV_ERROR_COULDNT_FIND_FIELD: {
		code: 7,
		message: "Failed to read env field : {field}",
		type: "ENV_ERROR_COULDNT_FIND_FIELD",
	},
	COULDNT_LOAD_ROLES: {
		code: 8,
		message: "Couldn't Load roles for this reason {reason}",
		type: "COULDNT_LOAD_ROLES",
	},
	// email issue
	EMAIL_ERROR_GENERIC: { code: 9, message: "Email error '{error}'", type: "EMAIL_ERROR_GENERIC" },
	GOOGLE_CLOUD_STORAGE_ERROR_GENERIC: { code: 10, message: "GOOGLE_CLOUD_STORAGE error '{error}'", type: "GOOGLE_CLOUD_STORAGE_ERROR_GENERIC" },
} as const;

export const HttpCodes: IErrors<IHttpStatusCodes> = {
	// Network usage
	Continue: { code: 100, message: "Continue", type: "Continue" },
	SwitchingProtocols: { code: 101, message: "Switching Protocols", type: "SwitchingProtocols" },
	Processing: { code: 102, message: "Processing", type: "Processing" },
	EarlyHints: { code: 103, message: "Early Hints", type: "EarlyHints" },

	// success response
	OK: { code: 200, message: "OK", type: "OK" },
	Created: { code: 201, message: "Created", type: "Created" },
	Accepted: { code: 202, message: "Accepted", type: "Accepted" },
	NonAuthoritativeInformation: {
		code: 203,
		message: "Non-Authoritative Information",
		type: "NonAuthoritativeInformation",
	},
	NoContent: { code: 204, message: "No Content", type: "NoContent" },
	ResetContent: { code: 205, message: "Reset Content", type: "ResetContent" },
	PartialContent: { code: 206, message: "Partial Content", type: "PartialContent" },
	MultiStatus: { code: 207, message: "Multi-Status", type: "MultiStatus" },
	AlreadyReported: { code: 208, message: "Already Reported", type: "AlreadyReported" },
	IMUsed: { code: 226, message: "IM Used", type: "IMUsed" },

	// Redirection Response
	MultipleChoices: { code: 300, message: "Multiple Choices", type: "MultipleChoices" },
	MovedPermanently: { code: 301, message: "Moved Permanently", type: "MovedPermanently" },
	Found: { code: 302, message: "Found", type: "Found" },
	SeeOther: { code: 303, message: "See Other", type: "SeeOther" },
	NotModified: { code: 304, message: "Not Modified", type: "NotModified" },
	TemporaryRedirect: { code: 307, message: "Temporary Redirect", type: "TemporaryRedirect" },
	PermanentRedirect: { code: 308, message: "Permanent Redirect", type: "PermanentRedirect" },

	// Client Error Respons
	BadRequest: { code: 400, message: "Bad Request", type: "BadRequest" },
	Unauthorized: { code: 401, message: "Unauthorized", type: "Unauthorized" },
	PaymentRequired: { code: 402, message: "Payment Required", type: "PaymentRequired" },
	Forbidden: { code: 403, message: "Forbidden", type: "Forbidden" },
	NotFound: { code: 404, message: "Not Found", type: "NotFound" },
	MethodNotAllowed: { code: 405, message: "Method Not Allowed", type: "MethodNotAllowed" },
	NotAcceptable: { code: 406, message: "Not Acceptable", type: "NotAcceptable" },
	ProxyAuthenticationRequired: {
		code: 407,
		message: "Proxy Authentication Required",
		type: "ProxyAuthenticationRequired",
	},
	RequestTimeout: { code: 408, message: "Request Timeout", type: "RequestTimeout" },
	Conflict: { code: 409, message: "Conflict", type: "Conflict" },
	Gone: { code: 410, message: "Gone", type: "Gone" },
	LengthRequired: { code: 411, message: "Length Required", type: "LengthRequired" },
	PreconditionFailed: { code: 412, message: "Precondition Failed", type: "PreconditionFailed" },
	PayloadTooLarge: { code: 413, message: "Payload Too Large", type: "PayloadTooLarge" },
	URITooLong: { code: 414, message: "URI Too Long", type: "URITooLong" },
	UnsupportedMediaType: { code: 415, message: "Unsupported Media Type", type: "UnsupportedMediaType" },
	RangeNotSatisfiable: { code: 416, message: "Range Not Satisfiable", type: "RangeNotSatisfiable" },
	ExpectationFailed: { code: 417, message: "Expectation Failed", type: "ExpectationFailed" },
	ImATeapot: { code: 418, message: "I'm a Teapot", type: "ImATeapot" },
	MisdirectedRequest: { code: 421, message: "Misdirected Request", type: "MisdirectedRequest" },
	UnprocessableEntity: { code: 422, message: "Unprocessable Entity", type: "UnprocessableEntity" },
	Locked: { code: 423, message: "Locked", type: "Locked" },
	FailedDependency: { code: 424, message: "Failed Dependency", type: "FailedDependency" },
	UpgradeRequired: { code: 426, message: "Upgrade Required", type: "UpgradeRequired" },
	PreconditionRequired: { code: 428, message: "Precondition Required", type: "PreconditionRequired" },
	TooManyRequests: { code: 429, message: "Too Many Requests", type: "TooManyRequests" },
	RequestHeaderFieldsTooLarge: {
		code: 431,
		message: "Request Header Fields Too Large",
		type: "RequestHeaderFieldsTooLarge",
	},
	UnavailableForLegalReasons: {
		code: 451,
		message: "Unavailable For Legal Reasons",
		type: "UnavailableForLegalReasons",
	},

	// Server Error Respons
	InternalServerError: { code: 500, message: "Internal Server Error", type: "InternalServerError" },
	NotImplemented: { code: 501, message: "Not Implemented", type: "NotImplemented" },
	BadGateway: { code: 502, message: "Bad Gateway", type: "BadGateway" },
	ServiceUnavailable: { code: 503, message: "Service Unavailable", type: "ServiceUnavailable" },
	GatewayTimeout: { code: 504, message: "Gateway Timeout", type: "GatewayTimeout" },
	HTTPVersionNotSupported: { code: 505, message: "HTTP Version Not Supported", type: "HTTPVersionNotSupported" },
	VariantAlsoNegotiates: { code: 506, message: "Variant Also Negotiates", type: "VariantAlsoNegotiates" },
	InsufficientStorage: { code: 507, message: "Insufficient Storage", type: "InsufficientStorage" },
	LoopDetected: { code: 508, message: "Loop Detected", type: "LoopDetected" },
	NotExtended: { code: 510, message: "Not Extended", type: "NotExtended" },
	NetworkAuthenticationRequired: {
		code: 511,
		message: "Network Authentication Required",
		type: "NetworkAuthenticationRequired",
	},
};



