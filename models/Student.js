// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  guardianName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  address: { type: String, required: true },
  enrolled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
