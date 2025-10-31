import "dotenv/config";
import swaggerAutogen from "swagger-autogen";
import { PORT, PROJECT_Name, BACK_URL } from "../config/Env";

const doc = {
	info: {
		title: `${PROJECT_Name} API`,
		description: "Production-ready Express.js REST API with TypeScript, MongoDB, Redis, and JWT authentication",
		version: "1.0.0",
		contact: {
			name: "API Support",
			email: "badlamoussaab@gmail.com",
		},
		license: {
			name: "ISC",
		},
	},
	host: BACK_URL.replace(/^https?:\/\//, ""),
	schemes: BACK_URL.startsWith("https") ? ["https", "http"] : ["http"],
	consumes: ["application/json"],
	produces: ["application/json"],
	tags: [
		{
			name: "Authentication",
			description: "User authentication and authorization endpoints",
		},
		{
			name: "Health",
			description: "Health check and monitoring endpoints",
		},
		{
			name: "Files",
			description: "File upload and management endpoints",
		},
	],
	securityDefinitions: {
		bearerAuth: {
			type: "apiKey",
			in: "header",
			name: "Authorization",
			description: "Enter your bearer token in the format: Bearer <token>",
		},
		cookieAuth: {
			type: "apiKey",
			in: "cookie",
			name: "token",
			description: "JWT token stored in cookie",
		},
	},
	definitions: {
		User: {
			_id: "507f1f77bcf86cd799439011",
			firstName: "John",
			lastName: "Doe",
			email: "john.doe@example.com",
			role: "user",
			enable: true,
			createdAt: "2025-01-15T10:30:00.000Z",
			updatedAt: "2025-01-15T10:30:00.000Z",
		},
		LoginRequest: {
			email: "john.doe@example.com",
			password: "Test@1234",
			stay: false,
		},
		RegisterRequest: {
			email: "john.doe@example.com",
			password: "Test@1234",
			firstName: "John",
			lastName: "Doe",
			stay: false,
		},
		LoginResponse: {
			status: "LOGIN_SUCCESS",
			message: "Logged in successfully",
			data: {
				$ref: "#/definitions/User",
				accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
				refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
			},
		},
		RefreshRequest: {
			refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
			stay: false,
		},
		ErrorResponse: {
			status: "error",
			message: "ERROR_TYPE",
			error: "Detailed error message",
		},
		HealthResponse: {
			uptime: 12345.67,
			timestamp: 1234567890000,
			status: "OK",
			checks: {
				mongodb: "UP",
				redis: "UP",
			},
		},
	},
};

const outputFile = "./src/docs/swagger.json";
const endpointsFiles = [
	"./src/routes/index.ts",
];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(
	(result) => {
		if (result && typeof result === "object" && "success" in result) {
			console.log(`Generated: ${result.success}`);
			if (result.success) {
				console.log("✅ Swagger documentation generated successfully!");
				console.log(`📄 File: ${outputFile}`);
				console.log(`🌐 View at: http://localhost:${PORT}/api-docs`);
			}
		}
	}
);
