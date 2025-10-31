import { describe, expect, test, beforeAll } from "@jest/globals";
import request from "supertest";
import { HttpCodes } from "@/config/Errors";
import { StopServer, app } from "@/app";
import { RandomEmail } from "@/utils/Function";
import { TEST_PASSWORD } from "@/utils/authUtilsTest";
import { UserModel, createUserFactory } from "@/db/models/user";
import { VerificationTokenModel } from "@/db/models/verificationToken";
import crypto from "crypto";

afterAll(async () => {
	await StopServer();
});

describe("Email Verification - Verify Email Endpoint", () => {
	test("Should successfully verify email with valid token", async () => {
		// Create user with unverified email
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: false
		});

		// Create verification token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await VerificationTokenModel.create({
			email: user.email,
			token,
			userId: user._id,
			expiresAt
		});

		// Verify email
		const response = await request(app)
			.post("/auth/verify-email")
			.send({ token });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("EMAIL_VERIFIED");
		expect(response.body.data).toHaveProperty("email", email);

		// Check user is verified in database
		const updatedUser = await UserModel.findById(user._id);
		expect(updatedUser?.emailVerified).toBe(true);
		expect(updatedUser?.verificationToken).toBeUndefined();

		// Check token is deleted
		const deletedToken = await VerificationTokenModel.findOne({ token });
		expect(deletedToken).toBeNull();
	});

	test("Should fail with invalid token", async () => {
		const response = await request(app)
			.post("/auth/verify-email")
			.send({ token: "invalid-token-123" });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("INVALID_TOKEN");
	});

	test("Should fail with expired token", async () => {
		// Create user
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: false
		});

		// Create expired token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() - 1000); // Expired 1 second ago

		await VerificationTokenModel.create({
			email: user.email,
			token,
			userId: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/verify-email")
			.send({ token });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("TOKEN_EXPIRED");
	});

	test("Should fail if email already verified", async () => {
		// Create verified user
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: true
		});

		// Create token anyway
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await VerificationTokenModel.create({
			email: user.email,
			token,
			userId: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/verify-email")
			.send({ token });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("EMAIL_ALREADY_VERIFIED");
	});

	test("Should fail without token", async () => {
		const response = await request(app)
			.post("/auth/verify-email")
			.send({});

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("error");
	});
});

describe("Email Verification - Resend Verification Endpoint", () => {
	test("Should successfully resend verification email for unverified user", async () => {
		// Create unverified user
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: false
		});

		const response = await request(app)
			.post("/auth/resend-verification")
			.send({ email });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("VERIFICATION_EMAIL_SENT");

		// Check token was created
		const token = await VerificationTokenModel.findOne({ email });
		expect(token).not.toBeNull();
		expect(token?.token).toBeTruthy();
	});

	test("Should fail if email already verified", async () => {
		// Create verified user
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: true
		});

		const response = await request(app)
			.post("/auth/resend-verification")
			.send({ email });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("EMAIL_ALREADY_VERIFIED");
	});

	test("Should return generic success for non-existent email (security)", async () => {
		const response = await request(app)
			.post("/auth/resend-verification")
			.send({ email: RandomEmail() });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("VERIFICATION_EMAIL_SENT");
	});

	test("Should fail without email", async () => {
		const response = await request(app)
			.post("/auth/resend-verification")
			.send({});

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("error");
	});
});

describe("Email Verification - Registration Integration", () => {
	test("Should send verification email on registration", async () => {
		const email = RandomEmail();

		const response = await request(app)
			.post("/auth/register")
			.send({
				email,
				password: TEST_PASSWORD,
				firstName: "Test",
				lastName: "User"
			});

		expect(response.status).toBe(HttpCodes.Created.code);
		expect(response.body.data).toHaveProperty("emailVerified", false);

		// Check verification token was created
		const token = await VerificationTokenModel.findOne({ email });
		expect(token).not.toBeNull();

		// Check user has verification token
		const user = await UserModel.findOne({ email });
		expect(user?.emailVerified).toBe(false);
		expect(user?.verificationToken).toBeTruthy();
	});
});

describe("Email Verification - Login Response", () => {
	test("Should include emailVerified in login response", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: false
		});

		const response = await request(app)
			.post("/auth/login")
			.send({
				email,
				password: TEST_PASSWORD
			});

		expect(response.status).toBe(HttpCodes.Accepted.code);
		expect(response.body.data).toHaveProperty("emailVerified", false);
	});

	test("Should show emailVerified true for verified users", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: true
		});

		const response = await request(app)
			.post("/auth/login")
			.send({
				email,
				password: TEST_PASSWORD
			});

		expect(response.status).toBe(HttpCodes.Accepted.code);
		expect(response.body.data).toHaveProperty("emailVerified", true);
	});
});
