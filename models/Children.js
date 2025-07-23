const mongoose = require("mongoose");

const childrenSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  address: { type: String, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: { type: String, required: false, default: '' },
  birthCertificateImage: { type: String, required: false, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Children", childrenSchema); 