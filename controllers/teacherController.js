const User = require("../models/User");

// Create teacher
exports.createTeacher = async (req, res) => {
  try {
    const { username, email, password, class: teacherClass } = req.body;
    
    const teacher = await User.create({
      username,
      email,
      password,
      role: "teacher",
      class: teacherClass
    });
    
    res.status(201).json({
      success: true,
      data: teacher
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: "teacher" });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: "teacher" },
      req.body,
      { new: true }
    );
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOneAndDelete({ _id: req.params.id, role: "teacher" });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};