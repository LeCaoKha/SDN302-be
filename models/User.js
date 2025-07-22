const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      default: '',
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["parent", "staff", "admin", "teacher"],
      default: "parent",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: false, // không bắt buộc
      default: null
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
