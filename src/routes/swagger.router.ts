import { Router, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { InDev } from "../config/Env";
import path from "path";
import fs from "fs";

const swaggerRouter = Router();

// Only enable Swagger in development or if explicitly enabled
if (InDev || process.env.ENABLE_SWAGGER === "true") {
	try {
		const swaggerPath = path.join(__dirname, "../docs/swagger.json");

		// Check if swagger.json exists
		if (fs.existsSync(swaggerPath)) {
			const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));

			// Swagger UI options
			const options = {
				explorer: true,
				customCss: ".swagger-ui .topbar { display: none }",
				customSiteTitle: "API Documentation",
			};

			// Serve Swagger UI
			swaggerRouter.use("/", swaggerUi.serve);
			swaggerRouter.get("/", swaggerUi.setup(swaggerDocument, options));

			// JSON endpoint
			swaggerRouter.get("/json", (_req: Request, res: Response) => {
				res.json(swaggerDocument);
			});
		} else {
			// Swagger not generated yet
			swaggerRouter.get("/", (_req: Request, res: Response) => {
				res.status(503).json({
					status: "error",
					message: "Swagger documentation not generated yet",
					instructions: "Run 'npm run swagger' to generate the documentation",
				});
			});
		}
	} catch (error) {
		console.error("Error loading Swagger documentation:", error);
		swaggerRouter.get("/", (_req: Request, res: Response) => {
			res.status(500).json({
				status: "error",
				message: "Error loading Swagger documentation",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		});
	}
} else {
	// Swagger disabled in production
	swaggerRouter.get("/", (_req: Request, res: Response) => {
		res.status(403).json({
			status: "error",
			message: "API documentation is disabled in production",
			hint: "Set ENABLE_SWAGGER=true to enable in production (not recommended)",
		});
	});
}

export default swaggerRouter;
