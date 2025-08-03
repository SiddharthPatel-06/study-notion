const mongoose = require("mongoose");

const userSchema = new mongoose.Schem(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["Student", "Instructor", "Admin"],
      requied: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    image: {
      type: String,
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
