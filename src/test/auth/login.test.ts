import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes, ExitCodes } from "../../config/Errors";
import { authLogs } from "../../services/auth/auth.logs";

import { StopServer, app } from "../../app";
import { formatString } from "../../utils/Strings";
import { RandomEmail, RandomString } from "../../utils/Function";
import { TEST_PASSWORD } from "../../utils/authUtilsTest";

afterAll(async () => {
  await StopServer();
});

const route = "/auth/login";

/**
 * @description  Test the login route
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @route {POST} /auth/login
 *
 *
 */

describe("Test the Login with valid email and password", () => {
  test("It should response with Success response", async () => {
    const response = await request(app).post(route).send({
      email: "badlamoussaab@gmail.com",
      password: TEST_PASSWORD,
    });
    expect(response.status).toBe(HttpCodes.Accepted.code);
    expect(response.body.status).toBe(authLogs.LOGIN_SUCCESS.type);
    expect(response.body.message).toBe(
      formatString(authLogs.LOGIN_SUCCESS.message, response.body.data)
    );
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
  });
});

describe("Test login with email doesn't exist", () => {
  test("It should response with generic error to prevent user enumeration", async () => {
    const email = RandomEmail();
    const response = await request(app).post(route).send({
      email: email,
      password: TEST_PASSWORD,
    });
    expect(response.status).toBe(HttpCodes.Unauthorized.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("LOGIN_ERROR");
    expect(response.body.error).toBe("Invalid email or password");
  });
});
describe("Test login with email exists and invalid password", () => {
  test("It should response with generic error to prevent user enumeration", async () => {
    const response = await request(app).post(route).send({
      email: "badlamoussaab@gmail.com",
      password: "WrongPass@123",
    });
    expect(response.status).toBe(HttpCodes.Unauthorized.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("LOGIN_ERROR");
    expect(response.body.error).toBe("Invalid email or password");
  });
});

describe("Test login route with invalid inputs", () => {
  test("It should response with Error response type : ERROR_INVALID_INPUT ", async () => {
    const response = await request(app).post(route).send({
      email: RandomEmail(),
    });
    expect(response.status).toBe(HttpCodes.BadRequest.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(ExitCodes.ERROR_INVALID_INPUT.type);
    expect(response.body.error).toContain("Password is required");
  });
});
