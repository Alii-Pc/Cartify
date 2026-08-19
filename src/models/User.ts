import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  googleId?: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  verificationEmailSentAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  resetPasswordEmailSentAt?: Date;
  fcmTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: function(this: any): boolean { return !this.googleId; },
      minlength: 8,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    verificationOtp: {
      type: String,
      select: false,
    },
    verificationOtpExpires: {
      type: Date,
      select: false,
    },
    verificationEmailSentAt: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpires: {
      type: Date,
      select: false,
    },
    resetPasswordEmailSentAt: {
      type: Date,
      select: false,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
