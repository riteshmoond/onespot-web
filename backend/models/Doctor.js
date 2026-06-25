const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    aboutDoctor: {
      type: String,
      required: true,
    },
    opdDays: {
      type: String,
      required: true,
      trim: true,
    },
    sundayTiming: {
      type: String,
      required: true,
      trim: true,
    },
    dailyTime: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
