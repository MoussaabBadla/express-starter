import { createUserFactory } from "../db/models/user";
import { RandomEmail } from "./Function";
import { Sign } from "./jwt";


export const authenticateAdmin = async (): Promise<string> => {
  const admin = await createUserFactory({ role: 'admin', password: "password", email: `admin-${RandomEmail()}` }) as any;
  const token = Sign({ _id: admin._id.toString(), role: admin.role });
  return token
};

export const authenticateUser = async (): Promise<string> => {
  const user = await createUserFactory({ role: 'user' }) as any
  const token = Sign({ _id: user._id.toString(), role: user.role });
  return token
};

