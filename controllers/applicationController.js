const Application = require("../models/Application");
const Student = require("../models/Student");

// POST /api/applications (parent only)
exports.submitApplication = async (req, res) => {
  try {
    const { studentName, birthdate, gender, address } = req.body;

    const application = await Application.create({
      studentName,
      birthdate,
      gender,
      address,
      createdBy: req.user._id,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/applications (parent views their own apps)
exports.getMyApplications = async (req, res) => {
  const applications = await Application.find({ createdBy: req.user._id });
  res.json(applications);
};

// GET /api/applications/all (staff only)
exports.getAllApplications = async (req, res) => {
  try {
    const allApplications = await Application.find().populate(
      "createdBy",
      "fullName email phone"
    );
    res.json(allApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved",  "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/applications/:id/enroll
exports.enrollFromApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);

    if (!app) return res.status(404).json({ message: "Application not found" });
    if (app.status !== "complete")
      return res.status(400).json({ message: "Application not approved yet" });

    const existing = await Student.findOne({
      fullName: app.studentName,
      birthdate: app.birthdate,
      gender: app.gender,
      address: app.address,
      parentId: app.createdBy,
    });

    if (existing) {
      return res.status(409).json({ message: "Student already enrolled" });
    }

    const student = await Student.create({
      fullName: app.studentName,
      birthdate: app.birthdate,
      gender: app.gender,
      address: app.address,
      parentId: app.createdBy,
    });

    res.status(201).json({ message: "Student enrolled successfully", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/:id (get application detail)
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build query based on user role
    let query = { _id: id };
    
    // If user is parent, they can only see their own applications
    if (req.user.role === "parent") {
      query.createdBy = req.user._id;
    }
    
    const application = await Application.findOne(query).populate(
      "createdBy",
      "fullName email phone"
    );
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id (parent update their own application, except status)
exports.updateApplicationForParent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    // Không cho phép parent cập nhật status
    if (updateFields.status !== undefined) {
      delete updateFields.status;
    }

    // Chỉ cho phép parent update application của chính mình
    const application = await Application.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      updateFields,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found or not authorized" });
    }

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
