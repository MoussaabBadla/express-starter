import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes, ExitCodes } from "../../config/Errors";
import { authLogs } from "../../services/auth/auth.logs";

import { StopServer, app } from "../../app";
import { formatString } from "../../utils/Strings";
import {RandomString } from "../../utils/Function";
import { authenticateUser } from "../../utils/authUtilsTest";

afterAll(async () => {
  await StopServer();
});
let jwt: string = "";
beforeAll(async () => {
  jwt = "Bearer " + (await authenticateUser());
});

const route = "/auth/";

/**
 * @description  Test the authback route with valid token
 * @param {String} token - Bearer token
 *
 *
 */

describe("Test the authback route with valid token ", () => {
  test("It should response with Success response", async () => {
    const response = await request(app).get(route).set("authorization", jwt);

    expect(response.status).toBe(HttpCodes.Accepted.code);
    expect(response.body.status).toBe(authLogs.AUTH_BACK.type);
    expect(response.body.message).toBe(
      formatString(authLogs.AUTH_BACK.message, {
        email: response.body.data.email,
        username:
          response.body.data.firstName + " " + response.body.data.lastName,
      })
    );
  });
});

/**
 * @description  Test the authback route with invalid token
 * @param {String} token - Bearer token
 *
 *
 */

describe("Test the authback route with invalid token ", () => {
  test("It should response with Unauthorized response", async () => {
    const response = await request(app)
      .get(route)
      .set("authorization", "Bearer " + RandomString());

    expect(response.status).toBe(HttpCodes.InternalServerError.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(
      authLogs.ERROR_WHILE_CHECKING_CREDENTIALS.message
    );
  });
});
