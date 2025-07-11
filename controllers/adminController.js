const User = require("../models/User");
const Student = require("../models/Student");
const Classroom = require("../models/Classroom");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Lấy tất cả staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff" });
  }
};

// Lấy staff theo id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: "staff" });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff by id" });
  }
};

// Ban staff (set status = inactive)
exports.banStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff" },
      { status: "inactive" },
      { new: true }
    );
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json({ message: "Staff banned", staff });
  } catch (error) {
    res.status(500).json({ message: "Error banning staff" });
  }
};

// Bỏ ban staff (set status = active)
exports.unbanStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff" },
      { status: "active" },
      { new: true }
    );
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json({ message: "Staff unbanned", staff });
  } catch (error) {
    res.status(500).json({ message: "Error unbanning staff" });
  }
};

// Lấy dữ liệu dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const parents = await User.find({ role: "parent" });
    const staff = await User.find({ role: "staff" });
    const teachers = await User.find({ role: "teacher" });
    const students = await Student.find();
    const classrooms = await Classroom.find();
    res.status(200).json({ parents, staff, teachers, students, classrooms });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};
