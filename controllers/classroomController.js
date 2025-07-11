const Classroom = require("../models/Classroom");
const Student = require("../models/Student");
const User = require("../models/User");

// Create a new classroom
exports.createClassroom = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const classroom = new Classroom({
      name,
      capacity,
      teacher: null,
      students: [],
    });
    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all classrooms
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate("teachers")
      .populate("students");
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a classroom by ID
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate("teachers")
      .populate("students");
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a classroom by ID
exports.updateClassroom = async (req, res) => {
  try {
    const { name, capacity, teacher, students } = req.body;
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { name, capacity, teacher, students },
      { new: true, runValidators: true }
    );
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    res.json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a classroom by ID
exports.deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    res.json({ message: "Classroom deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add students to a classroom (multiple)
exports.addStudentToClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    let { studentId, studentIds } = req.body;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    // Hỗ trợ cả 1 id hoặc mảng id
    let ids = [];
    if (Array.isArray(studentIds)) ids = studentIds;
    else if (studentId) ids = [studentId];
    else return res.status(400).json({ error: "No studentId(s) provided" });
    let added = [];
    let skipped = [];
    for (const id of ids) {
      const student = await Student.findById(id);
      if (!student) continue;
      // Nếu student đã có classId khác classroomId hiện tại thì bỏ qua
      if (student.classId && student.classId.toString() !== classroomId) {
        skipped.push(student._id);
        continue;
      }
      if (!student.classId || student.classId.toString() !== classroomId) {
        student.classId = classroomId;
        await student.save();
      }
      if (!classroom.students.includes(student._id)) {
        classroom.students.push(student._id);
        added.push(student._id);
      }
    }
    await classroom.save();
    await classroom.populate("students");
    res.json({ classroom, added, skipped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add teachers to a classroom (multiple)
exports.addTeacherToClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    let { teacherId, teacherIds } = req.body;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    let ids = [];
    if (Array.isArray(teacherIds)) ids = teacherIds;
    else if (teacherId) ids = [teacherId];
    else return res.status(400).json({ error: "No teacherId(s) provided" });
    let added = [];
    for (const id of ids) {
      const teacher = await User.findById(id);
      if (!teacher) continue;
      if (!classroom.teachers.includes(teacher._id)) {
        classroom.teachers.push(teacher._id);
        added.push(teacher._id);
      }
    }
    await classroom.save();
    await classroom.populate("teachers");
    res.json({ classroom, added });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove students from a classroom (multiple)
exports.removeStudentFromClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    let { studentId, studentIds } = req.body;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    let ids = [];
    if (Array.isArray(studentIds)) ids = studentIds;
    else if (studentId) ids = [studentId];
    else return res.status(400).json({ error: "No studentId(s) provided" });
    let removed = [];
    for (const id of ids) {
      const idx = classroom.students.indexOf(id);
      if (idx !== -1) {
        classroom.students.splice(idx, 1);
        removed.push(id);
        // Xóa classId của student này
        const student = await Student.findById(id);
        if (student) {
          student.classId = null;
          await student.save();
        }
      }
    }
    await classroom.save();
    await classroom.populate("students");
    res.json({ classroom, removed });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove teachers from a classroom (multiple)
exports.removeTeacherFromClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    let { teacherId, teacherIds } = req.body;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    let ids = [];
    if (Array.isArray(teacherIds)) ids = teacherIds;
    else if (teacherId) ids = [teacherId];
    else return res.status(400).json({ error: "No teacherId(s) provided" });
    let removed = [];
    for (const id of ids) {
      const idx = classroom.teachers.indexOf(id);
      if (idx !== -1) {
        classroom.teachers.splice(idx, 1);
        removed.push(id);
      }
    }
    await classroom.save();
    await classroom.populate("teachers");
    res.json({ classroom, removed });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
