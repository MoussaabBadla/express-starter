import { Schema, model, Document, Types } from "mongoose";

export interface VerificationTokenI {
	email: string;
	token: string;
	userId: Types.ObjectId;
	createdAt: Date;
	expiresAt: Date;
}

export interface VerificationTokenD extends Document<VerificationTokenI>, VerificationTokenI {}

const verificationTokenSchema = new Schema<VerificationTokenI>(
	{
		email: { type: String, required: true, index: true },
		token: { type: String, required: true, unique: true, index: true },
		userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
		createdAt: { type: Date, default: Date.now },
		expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index for auto-cleanup
	},
	{
		timestamps: false,
	}
);

// Index for efficient lookups
verificationTokenSchema.index({ email: 1, userId: 1 });

export const VerificationTokenModel = model<VerificationTokenI>("VerificationTokens", verificationTokenSchema);
