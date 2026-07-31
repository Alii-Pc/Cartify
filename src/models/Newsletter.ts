import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Newsletter =
  mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);
