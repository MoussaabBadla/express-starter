import { UserModel, createUserFactory } from "../models/user";
import { globalLogger } from "../../utils/Logger";
import bcrypt from "bcrypt";

export const seedUsers = async () => {
  try {
    const email = process.env.USER_email || "badlamoussaab@gmail.com";
    const password = process.env.USER_password || "Test@1234";

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      // Update existing user with new password
      const hashedPassword = await bcrypt.hash(password, 12);
      existingUser.password = hashedPassword;
      existingUser.firstName = process.env.USER_firstName || "Moussaab";
      existingUser.lastName = process.env.USER_lastName || "Badla";
      existingUser.role = "admin";
      await existingUser.save();

      globalLogger.info("🌱 Updated existing seeded user:", existingUser.email);
      return existingUser;
    }

    // Create new user
    const user = await createUserFactory({
      firstName: process.env.USER_firstName || "Moussaab",
      lastName: process.env.USER_lastName || "Badla",
      email,
      password,
      role: "admin",
    });

    if (user) {
      globalLogger.info("🌱 Created new seeded user:", email);
      return user;
    }
    return null;
  } catch (err) {
    globalLogger.error(`🔥seeding failed  err : ${err}`);
    return null;
  }
};
