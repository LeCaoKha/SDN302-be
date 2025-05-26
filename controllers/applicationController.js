const Application = require('../models/Application');
const Student = require('../models/Student');

// POST /api/applications (parent only)
exports.submitApplication = async (req, res) => {
  try {
    const { studentName, birthdate, gender } = req.body;

    const application = await Application.create({
      studentName,
      birthdate,
      gender,
      createdBy: req.user._id,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// GET /api/applications (parent views their own apps)
exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ createdBy: req.user._id });
  res.json(apps);
};

// GET /api/applications/all (staff only)
exports.getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find().populate('createdBy', 'name email');
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PATCH /api/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'complete', 'needs-info'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!app) return res.status(404).json({ message: 'Application not found' });

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST /api/applications/:id/enroll
exports.enrollFromApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);

    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status !== 'complete') return res.status(400).json({ message: 'Application not approved yet' });

    const existing = await Student.findOne({
      fullName: app.studentName,
      birthdate: app.birthdate,
      parentId: app.createdBy,
    });

    if (existing) {
      return res.status(409).json({ message: 'Student already enrolled' });
    }

    const student = await Student.create({
      fullName: app.studentName,
      birthdate: app.birthdate,
      gender: app.gender,
      parentId: app.createdBy
    });

    res.status(201).json({ message: 'Student enrolled successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
