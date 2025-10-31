import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { HttpCodes } from "../../config/Errors";
import { StopServer, app } from "../../app";
import { authenticateAdmin, authenticateUser } from "../../utils/authUtilsTest";
import path from "path";
import fs from "fs/promises";
import { StaticRoot } from "../../config/Env";

afterAll(async () => {
	await StopServer();
});

const route = "/media";
const testFilesDir = path.join(__dirname, "test-files");
const uploadsDir = path.join(StaticRoot, "uploads");

// Create test files before running tests
beforeAll(async () => {
	// Ensure test files directory exists
	await fs.mkdir(testFilesDir, { recursive: true });

	// Create a small valid ZIP file for testing
	const validZipPath = path.join(testFilesDir, "test-valid.zip");
	// Create a minimal ZIP file (PK header + empty central directory)
	const zipBuffer = Buffer.from([
		0x50, 0x4b, 0x05, 0x06, // End of central directory signature
		0x00, 0x00, 0x00, 0x00, // Number of this disk
		0x00, 0x00, 0x00, 0x00, // Disk where central directory starts
		0x00, 0x00, // Number of central directory records on this disk
		0x00, 0x00, // Total number of central directory records
		0x00, 0x00, 0x00, 0x00, // Size of central directory
		0x00, 0x00, 0x00, 0x00, // Offset of start of central directory
		0x00, 0x00, // ZIP file comment length
	]);
	await fs.writeFile(validZipPath, zipBuffer);

	// Create an invalid file (not a ZIP)
	const invalidFilePath = path.join(testFilesDir, "test-invalid.txt");
	await fs.writeFile(invalidFilePath, "This is not a ZIP file");

	// Ensure uploads directory exists
	await fs.mkdir(uploadsDir, { recursive: true });
});

/**
 * @description Test file upload with admin user
 * @route {POST} /media
 */
describe("Test file upload with valid admin user", () => {
	test("It should upload a ZIP file successfully", async () => {
		const adminToken = await authenticateAdmin();
		const validZipPath = path.join(testFilesDir, "test-valid.zip");

		const response = await request(app)
			.post(route)
			.set("Authorization", `Bearer ${adminToken}`)
			.attach("file", validZipPath);

		expect(response.status).toBe(HttpCodes.Accepted.code);
		expect(response.body.data).toHaveProperty("name");
		expect(response.body.data).toHaveProperty("originalname", "test-valid.zip");
		expect(response.body.data).toHaveProperty("size");
		expect(response.body.data).toHaveProperty("url");
		expect(response.body.message).toContain("uploaded");
	});
});

/**
 * @description Test file upload with location parameter
 * @route {POST} /media?location=subfolder
 */
describe("Test file upload with location parameter", () => {
	test("It should upload file to specified subfolder", async () => {
		const adminToken = await authenticateAdmin();
		const validZipPath = path.join(testFilesDir, "test-valid.zip");

		const response = await request(app)
			.post(`${route}?location=test-folder`)
			.set("Authorization", `Bearer ${adminToken}`)
			.attach("file", validZipPath);

		expect(response.status).toBe(HttpCodes.Accepted.code);
		expect(response.body.data.location).toBe("test-folder");
		expect(response.body.data.url).toContain("test-folder");
	});
});

/**
 * @description Test file upload without authentication
 * @route {POST} /media
 */
describe("Test file upload without authentication", () => {
	test("It should return 401 Unauthorized", async () => {
		const validZipPath = path.join(testFilesDir, "test-valid.zip");

		const response = await request(app)
			.post(route)
			.attach("file", validZipPath);

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
	});
});

/**
 * @description Test file upload with regular user (not admin)
 * @route {POST} /media
 */
describe("Test file upload with non-admin user", () => {
	test("It should return 401 Unauthorized (admin required)", async () => {
		const userToken = await authenticateUser();
		const validZipPath = path.join(testFilesDir, "test-valid.zip");

		const response = await request(app)
			.post(route)
			.set("Authorization", `Bearer ${userToken}`)
			.attach("file", validZipPath);

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
	});
});

/**
 * @description Test file upload with invalid file type
 * @route {POST} /media
 */
describe("Test file upload with invalid file type", () => {
	test("It should reject non-ZIP files", async () => {
		const adminToken = await authenticateAdmin();
		const invalidFilePath = path.join(testFilesDir, "test-invalid.txt");

		const response = await request(app)
			.post(route)
			.set("Authorization", `Bearer ${adminToken}`)
			.attach("file", invalidFilePath);

		expect(response.status).toBe(HttpCodes.BadRequest.code);
	});
});

/**
 * @description Test file upload without file
 * @route {POST} /media
 */
describe("Test file upload without file attached", () => {
	test("It should return error for missing file", async () => {
		const adminToken = await authenticateAdmin();

		const response = await request(app)
			.post(route)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({});

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.message).toContain("No file received");
	});
});

/**
 * @description Test file deletion
 * @route {DELETE} /media
 */
describe("Test file deletion with admin user", () => {
	test("It should delete an uploaded file", async () => {
		const adminToken = await authenticateAdmin();
		const validZipPath = path.join(testFilesDir, "test-valid.zip");

		// First, upload a file
		const uploadResponse = await request(app)
			.post(route)
			.set("Authorization", `Bearer ${adminToken}`)
			.attach("file", validZipPath);

		expect(uploadResponse.status).toBe(HttpCodes.Accepted.code);
		const filename = uploadResponse.body.data.name;

		// Then, delete it
		const deleteResponse = await request(app)
			.delete(route)
			.set("Authorization", `Bearer ${adminToken}`)
			.set("Content-Type", "application/json")
			.send({ name: filename });

		expect(deleteResponse.status).toBe(HttpCodes.OK.code);
		expect(deleteResponse.body.message).toContain("deleted");
	});
});

/**
 * @description Test file deletion without authentication
 * @route {DELETE} /media
 */
describe("Test file deletion without authentication", () => {
	test("It should return 401 Unauthorized", async () => {
		const response = await request(app)
			.delete(route)
			.set("Content-Type", "application/json")
			.send({ name: "somefile.zip" });

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
	});
});

/**
 * @description Test file deletion with non-admin user
 * @route {DELETE} /media
 */
describe("Test file deletion with non-admin user", () => {
	test("It should return 401 Unauthorized (admin required)", async () => {
		const userToken = await authenticateUser();

		const response = await request(app)
			.delete(route)
			.set("Authorization", `Bearer ${userToken}`)
			.set("Content-Type", "application/json")
			.send({ name: "somefile.zip" });

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
	});
});

/**
 * @description Test file deletion for non-existent file
 * @route {DELETE} /media
 */
describe("Test file deletion for non-existent file", () => {
	test("It should return error", async () => {
		const adminToken = await authenticateAdmin();

		const response = await request(app)
			.delete(route)
			.set("Authorization", `Bearer ${adminToken}`)
			.set("Content-Type", "application/json")
			.send({ name: "non-existent-file.zip" });

		expect(response.status).toBeGreaterThanOrEqual(400);
	});
});
