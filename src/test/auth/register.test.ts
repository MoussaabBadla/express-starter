import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes, ExitCodes } from "../../config/Errors";
import { authLogs } from "../../services/auth/auth.logs";

import { StopServer, app } from "../../app";
import { formatString } from "../../utils/Strings";
import { RandomEmail } from "../../utils/Function";
import {UserModel} from "../../db/models/user";
import { TEST_PASSWORD } from "../../utils/authUtilsTest";

afterAll(async () => {
  await StopServer();
});

const route = "/auth/register";

/**
 * @description  Test the register route
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @param {string} firstName - The first name of the user
 * @param {string} lastName - The last name of the user
 * @route {POST} /auth/register
 *
 */

describe("Test register with valid email and password", () => {
  test("It should response with Success response", async () => {
    const email = RandomEmail();
    const response = await request(app).post(route).send({
      email: email,
      password: TEST_PASSWORD,
      firstName: "moussaab",
      lastName: "badla",
    });
    expect(response.status).toBe(HttpCodes.Created.code);
    expect(response.body.status).toBe(authLogs.REGISTER_SUCCESS.type);
    expect(response.body.message).toBe(
      formatString(authLogs.REGISTER_SUCCESS.message, response.body.data)
    );
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
    await UserModel.deleteOne({ email: email }).exec();
  });
});

describe("register with email already exist", () => {
  test("It should response with Error response type : REGISTER_ERROR_EMAIL_ALREADY_EXIST ", async () => {
    const email = "badlamoussaab@gmail.com";
    const response = await request(app).post(route).send({
      email: email,
      password: TEST_PASSWORD,
      firstName: "moussaab",
      lastName: "badla",
    });
    expect(response.status).toBe(HttpCodes.BadRequest.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(
      authLogs.REGISTER_ERROR_EMAIL_EXIST.type
    );
    expect(response.body.error).toBe(
      formatString(authLogs.REGISTER_ERROR_EMAIL_EXIST.message, { email })
    );
  });
});

describe("register with invalid input", () => {
  test("It should response with Error response type : ERROR_INVALID_INPUT ", async () => {
    const response = await request(app).post(route).send({
      email: RandomEmail(),
      password: TEST_PASSWORD,
      firstName: "moussaab",
    });
    expect(response.status).toBe(HttpCodes.BadRequest.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(ExitCodes.ERROR_INVALID_INPUT.type);
    expect(response.body.error).toContain(
      "Last name must be at least 2 characters long"
    );
  });
});

describe("register with invalid password", () => {
  test("It should response with Error response type : ERROR_INVALID_INPUT ", async () => {
    const response = await request(app).post(route).send({
      email: RandomEmail(),
      password: "pass",
      firstName: "moussaab",
      lastName: "badla",
    });
    expect(response.status).toBe(HttpCodes.BadRequest.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(ExitCodes.ERROR_INVALID_INPUT.type);
    expect(response.body.error).toContain(
      "Password must be at least 8 characters long"
    );
  });
});

describe("register with weak password", () => {
  test("It should response with Error - missing uppercase", async () => {
    const response = await request(app).post(route).send({
      email: RandomEmail(),
      password: "weak@1234",
      firstName: "moussaab",
      lastName: "badla",
    });
    expect(response.status).toBe(HttpCodes.BadRequest.code);
    expect(response.body.status).toBe("error");
    expect(response.body.error).toContain(
      "Password must contain at least one uppercase letter"
    );
  });
});

describe("register with invalid email", () => {
  test("It should response with Error response type : ERROR_INVALID_INPUT ", async () => {
    const response = await request(app).post(route).send({
      email: "badlamoussaab",
      password: TEST_PASSWORD,
      firstName: "moussaab",
      lastName: "badla",
    });
    expect(response.status).toBe(HttpCodes.BadRequest.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(ExitCodes.ERROR_INVALID_INPUT.type);
    expect(response.body.error).toContain("Invalid email");
  });
});
