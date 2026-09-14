import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = ["citizen", "rescue", "volunteer", "hospital", "admin"];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address."],
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ROLES,
      default: "citizen",
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    latitude: Number,
    longitude: Number,
    profile: {
      // Free-form bag for role-specific extras (skills, availability, hospital name, etc.)
      // Keeps this schema generic; role-specific modules can read/write into it or
      // graduate fields into dedicated models (Volunteer, Hospital) as those are built.
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Hash the password whenever it's set/changed, never store plaintext.
userSchema.methods.setPassword = async function setPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never leak the hash even if a document with it selected is serialized.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
