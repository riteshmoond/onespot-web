const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
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
    doctorName: {
      type: String,
      trim: true,
      default: "",
    },
    doctorPosition: {
      type: String,
      trim: true,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
