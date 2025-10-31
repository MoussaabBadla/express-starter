import { describe, expect, test, afterAll } from "@jest/globals";
import { UserModel, createUserFactory, UserD } from "../../db/models/user";
import { StopServer } from "../../app";
import { RandomEmail } from "../../utils/Function";

afterAll(async () => {
	await StopServer();
});

/**
 * @description Test User Model - Optimize method
 */
describe("Test User Model - Optimize method", () => {
	test("It should remove password from user object", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
		});

		const optimized = user.Optimize();

		expect(optimized).not.toHaveProperty("password");
		expect(optimized).toHaveProperty("email");
		expect(optimized).toHaveProperty("firstName");
		expect(optimized).toHaveProperty("lastName");
		expect(optimized).toHaveProperty("role");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should keep all other user properties", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			firstName: "Test",
			lastName: "User",
			role: "admin",
		});

		const optimized = user.Optimize();

		expect(optimized.email).toBe(email);
		expect(optimized.firstName).toBe("Test");
		expect(optimized.lastName).toBe("User");
		expect(optimized.role).toBe("admin");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});
});

/**
 * @description Test User Model - comparePasswords method
 */
describe("Test User Model - comparePasswords method", () => {
	test("It should return true for correct password", async () => {
		const password = "Test@1234";
		const user = await createUserFactory({
			email: RandomEmail(),
			password,
		});

		const isMatch = await user.comparePasswords(password);
		expect(isMatch).toBe(true);

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should return false for incorrect password", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
		});

		const isMatch = await user.comparePasswords("WrongPassword123!");
		expect(isMatch).toBe(false);

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should return false for empty password", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
		});

		const isMatch = await user.comparePasswords("");
		expect(isMatch).toBe(false);

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});
});

/**
 * @description Test User Model - Password validation
 */
describe("Test User Model - Password validation", () => {
	test("It should reject password shorter than 8 characters", async () => {
		try {
			await createUserFactory({
				email: RandomEmail(),
				password: "Test@1",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.message).toContain("at least 8 characters");
		}
	});

	test("It should reject password without uppercase letter", async () => {
		try {
			await createUserFactory({
				email: RandomEmail(),
				password: "test@1234",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.message).toContain("uppercase letter");
		}
	});

	test("It should reject password without lowercase letter", async () => {
		try {
			await createUserFactory({
				email: RandomEmail(),
				password: "TEST@1234",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.message).toContain("lowercase letter");
		}
	});

	test("It should reject password without number", async () => {
		try {
			await createUserFactory({
				email: RandomEmail(),
				password: "Test@Test",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.message).toContain("number");
		}
	});

	test("It should reject password without special character", async () => {
		try {
			await createUserFactory({
				email: RandomEmail(),
				password: "Test1234",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.message).toContain("special character");
		}
	});

	test("It should accept strong password", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "StrongP@ssw0rd!",
		});

		expect(user).toBeDefined();
		expect(user.email).toBeDefined();

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});
});

/**
 * @description Test User Model - Password hashing
 */
describe("Test User Model - Password hashing", () => {
	test("It should hash password before saving", async () => {
		const plainPassword = "Test@1234";
		const user = await createUserFactory({
			email: RandomEmail(),
			password: plainPassword,
		});

		// Password should be hashed, not plain text
		expect(user.password).not.toBe(plainPassword);
		expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash pattern

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should re-hash password when modified", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
		});

		const originalHash = user.password;

		// Update password
		user.password = "NewP@ssw0rd123";
		await user.save();

		// Hash should be different
		expect(user.password).not.toBe(originalHash);
		expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/);

		// New password should work
		const isMatch = await user.comparePasswords("NewP@ssw0rd123");
		expect(isMatch).toBe(true);

		// Old password should not work
		const oldMatch = await user.comparePasswords("Test@1234");
		expect(oldMatch).toBe(false);

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});
});

/**
 * @description Test User Model - Email validation
 */
describe("Test User Model - Email validation", () => {
	test("It should reject invalid email format", async () => {
		try {
			await createUserFactory({
				email: "invalid-email",
				password: "Test@1234",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.message).toContain("valid email");
		}
	});

	test("It should accept valid email format", async () => {
		const user = await createUserFactory({
			email: "valid.email@example.com",
			password: "Test@1234",
		});

		expect(user).toBeDefined();
		expect(user.email).toBe("valid.email@example.com");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should reject duplicate emails", async () => {
		const email = RandomEmail();
		const user1 = await createUserFactory({
			email,
			password: "Test@1234",
		});

		try {
			await createUserFactory({
				email, // Same email
				password: "Test@1234",
			});
			fail("Should have thrown an error");
		} catch (error: any) {
			expect(error.code).toBe(11000); // MongoDB duplicate key error
		}

		// Clean up
		await UserModel.deleteOne({ _id: user1._id });
	});
});

/**
 * @description Test User Model - Default values
 */
describe("Test User Model - Default values", () => {
	test("It should set default role to 'user'", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
		});

		expect(user.role).toBe("user");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should set default enable to true", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
		});

		expect(user.enable).toBe(true);

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should allow setting role to 'admin'", async () => {
		const user = await createUserFactory({
			email: RandomEmail(),
			password: "Test@1234",
			role: "admin",
		});

		expect(user.role).toBe("admin");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should allow setting enable to false", async () => {
		const user = new UserModel({
			firstName: "Test",
			lastName: "User",
			email: RandomEmail(),
			password: "Test@1234",
			enable: false,
		});
		await user.save();

		expect(user.enable).toBe(false);

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});
});

/**
 * @description Test createUserFactory
 */
describe("Test createUserFactory", () => {
	test("It should create user with provided properties", async () => {
		const props = {
			firstName: "Alice",
			lastName: "Smith",
			email: RandomEmail(),
			password: "Alice@1234",
			role: "admin" as const,
		};

		const user = await createUserFactory(props);

		expect(user.firstName).toBe("Alice");
		expect(user.lastName).toBe("Smith");
		expect(user.email).toBe(props.email);
		expect(user.role).toBe("admin");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});

	test("It should use defaults for missing properties", async () => {
		const user = await createUserFactory({});

		expect(user.firstName).toBe("John");
		expect(user.lastName).toBe("Doe");
		expect(user.email).toBeDefined();
		expect(user.role).toBe("user");

		// Clean up
		await UserModel.deleteOne({ _id: user._id });
	});
});
