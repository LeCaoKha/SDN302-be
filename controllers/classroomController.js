const Classroom = require('../models/Classroom');
const Student = require('../models/Student');

// Create a new class (staff/admin only)
exports.createClassroom = async (req, res) => {
  try {
    const { name, capacity } = req.body;

    const classroom = await Classroom.create({ name, capacity });
    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all classes
exports.getAllClassrooms = async (req, res) => {
  try {
    const classes = await Classroom.find().populate('teacher', 'name').populate('students', 'fullName');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign a student to a class
exports.assignStudentToClassroom = async (req, res) => {
  try {
    const { studentId, classroomId } = req.body;

    const classroom = await Classroom.findById(classroomId);
    const student = await Student.findById(studentId);

    if (!classroom || !student) return res.status(404).json({ message: 'Classroom or Student not found' });

    if (classroom.students.length >= classroom.capacity) {
      return res.status(400).json({ message: 'Classroom is full' });
    }

    // Avoid duplicate assignment
    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already assigned to this class' });
    }

    classroom.students.push(studentId);
    await classroom.save();

    res.json({ message: 'Student assigned to classroom', classroom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
