import { Schema, model, Document, Types } from "mongoose";

export interface PasswordResetI {
	email: string;
	token: string;
	user: Types.ObjectId;
	createdAt: Date;
	expiresAt: Date;
}

export interface PasswordResetD extends Document<PasswordResetI>, PasswordResetI {}

const passwordResetSchema = new Schema<PasswordResetI>(
	{
		email: { type: String, required: true, index: true },
		token: { type: String, required: true, unique: true, index: true },
		user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
		createdAt: { type: Date, default: Date.now },
		expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index for auto-cleanup
	},
	{
		timestamps: false,
	}
);

// Index for efficient lookups
passwordResetSchema.index({ email: 1, user: 1 });

export const PasswordResetModel = model<PasswordResetI>("PasswordResets", passwordResetSchema);
