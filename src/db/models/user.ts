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
  },
  {
    timestamps: true,
    discriminatorKey: "kind",
  }
);

usersSchema.index({ email: 1 }, { unique: true });

usersSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("password")) {
      if (this.password.length < 8)
        throw new Error("Password must be at least 8 characters long");
      this.password = await bcrypt.hash(this.password, 10);
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
    password: props.password || "password",
    role: props.role || "user",
  });
  const savedUser = await user.save();
  return savedUser;
};
