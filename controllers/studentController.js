const Student = require('../models/Student');

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};

exports.getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
};

exports.updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
};

exports.deleteStudent = async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student deleted' });
};

exports.getStudentsByParentId = async (req, res) => {
  try {
    const students = await Student.find({ parentId: req.params.parentId });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsByName = async (req, res) => {
  const { fullName } = req.query;
  if (!fullName) return res.status(400).json({ message: 'Missing fullName query' });
  try {
    const students = await Student.find({ fullName: { $regex: fullName, $options: 'i' } });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsByClass = async (req, res) => {
  const { className } = req.query;
  if (!className) return res.status(400).json({ message: 'Missing className query' });
  try {
    const students = await Student.find({ className });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};