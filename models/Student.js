// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  fullName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  image: { type: String, required: false, default: '' },
  birthCertificateImage: { type: String, required: false, default: '' },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: false, // có thể null nếu chưa xếp lớp
  },
  grade: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
