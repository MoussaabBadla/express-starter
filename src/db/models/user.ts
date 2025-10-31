import { Model, Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { RandomEmail, validateEmail } from "../../utils/Function";
const required = true;
export interface UserD extends Document<UserI>, UserI {
  comparePasswords(password: string): Promise<boolean>;
  Optimize(): OptimizedUser;
}

export interface UserModel extends Model<UserD> {
  findUser(id: string): Promise<UserI>;
}
const usersSchema = new Schema<UserI>(
  {
    firstName: { type: String, required },
    lastName: { type: String, required },
    email: {
      type: String,
      required,
      validate: [validateEmail, "Please fill a valid email address"],
    },
    password: { type: String, required },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    enable: { type: Boolean, default: true },
	emailVerified: { type: Boolean, default: false },
	verificationToken: { type: String, default: null },
	verificationTokenExpires: { type: Date, default: null },
	accountStatus: { type: String, enum: ["active", "locked", "deleted"], default: "active" },
	lockedAt: { type: Date, default: null },
	lockedReason: { type: String, default: null },
	deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    discriminatorKey: "kind",
  }
);

usersSchema.index({ email: 1 }, { unique: true });

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  return { valid: true };
}

usersSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("password")) {
      const validation = validatePasswordStrength(this.password);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      this.password = await bcrypt.hash(this.password, 12); // Increased salt rounds from 10 to 12
    }
    next();
  } catch (err) {
    next(err as Error);
  }
});



usersSchema.set("toJSON", { virtuals: true });

usersSchema.methods.Optimize = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

usersSchema.methods.comparePasswords = async function (
  candidatePassword: string
) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    return false;
  }
};







export const UserModel = model<UserI, UserModel>("Users", usersSchema);

export const createUserFactory = async (
  props: Partial<UserI>
): Promise<UserD> => {
  const user = new UserModel({
    firstName: props.firstName || "John",
    lastName: props.lastName || "Doe",
    email: props.email || RandomEmail(),
    password: props.password || "Test@1234", // Strong default password for testing
    role: props.role || "user",
  });
  const savedUser = await user.save();
  return savedUser;
};
