import { JWT_SECRET } from "../config/CheckableEnv";
import jwt from "jsonwebtoken";

export const Sign = (payload: MyPayload) => {
    return jwt.sign(payload, JWT_SECRET);
};

export const Verify = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as MyPayload;
};
