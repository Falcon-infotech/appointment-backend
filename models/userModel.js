import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {

    timeZone: { type: String },
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must be less than 50 characters"],
    },
    last_name: {
      type: String,
      trim: true,
      maxlength: [50, "Last name must be less than 50 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      // match: [/^\+[1-9]\d{1,14}$/, "Invalid international phone number"],
      match: [
        /^(\+[1-9][0-9]{1,3}\s?)?[1-9][0-9]{9,13}$/, 
        "Invalid international phone number",
      ],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      match: [/\S+@\S+\.\S+/, "Email format is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // userId: { type: String, required: [false, "User ID is required"] },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
