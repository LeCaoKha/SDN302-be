// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
