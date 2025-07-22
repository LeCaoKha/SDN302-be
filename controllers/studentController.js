const Student = require("../models/Student");

// Create student
// exports.createStudent = async (req, res) => {
//   try {
//     const student = await Student.create(req.body);
//     res.status(201).json(student);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

exports.createStudent = async (req, res) => {
  try {
    if (req.user.role === "parent" && req.body.parentId !== req.user.id) {
      return res.status(403).json({
        message: "Bạn chỉ có thể tạo học sinh cho chính mình",
      });
    }
    let { _id, id, fullName, birthdate, gender, image, birthCertificateImage, parentId, classId } = req.body;
    // Ưu tiên _id, sau đó id, nếu không có thì để mặc định
    let studentData = { fullName, birthdate, gender, image, birthCertificateImage, parentId, classId };
    if (_id) studentData._id = _id;
    else if (id) studentData._id = id;
    const student = await Student.create(studentData);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Get all students
exports.getAllStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};

// Get single student
exports.getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

// Update student
exports.updateStudent = async (req, res) => {
  let { fullName, birthdate, gender, image, birthCertificateImage, parentId, classId } = req.body;
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { fullName, birthdate, gender, image, birthCertificateImage, parentId, classId },
    { new: true }
  );
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

// Delete student
exports.deleteStudent = async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json({ message: "Student deleted" });
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