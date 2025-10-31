import { createUserFactory } from "../db/models/user";
import { RandomEmail } from "./Function";
import { Sign } from "./jwt";

/**
 * Strong test password that meets all validation requirements
 */
export const TEST_PASSWORD = "Test@1234";

/**
 * Create an authenticated admin user for testing
 * @returns Access token for the admin user
 */
export const authenticateAdmin = async (): Promise<string> => {
  const admin = await createUserFactory({
    role: 'admin',
    password: TEST_PASSWORD,
    email: `admin-${RandomEmail()}`
  }) as any;
  const token = Sign({ _id: admin._id.toString(), role: admin.role });
  return token;
};

/**
 * Create an authenticated regular user for testing
 * @returns Access token for the user
 */
export const authenticateUser = async (): Promise<string> => {
  const user = await createUserFactory({
    role: 'user',
    password: TEST_PASSWORD
  }) as any;
  const token = Sign({ _id: user._id.toString(), role: user.role });
  return token;
};

