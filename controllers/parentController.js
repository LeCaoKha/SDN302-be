const User = require('../models/User');
const Student = require('../models/Student');
// exports.getParents = async (req, res) => {
//   try {
//     const parents = await User.find({ role: 'parent', status: "active"  }).select('-password');
//     res.json(parents);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getParents = async (req, res) => {
  try {
    const parents = await User.find({ 
      role: "parent", 
    });
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parent = await User.findOne({ _id: req.params.id, role: 'parent', status: "active" }).select('-password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getParentsByName = async (req, res) => {
  const { fullName } = req.query;
  if (!fullName) return res.status(400).json({ error: 'Missing fullName query' });
  try {
    const parents = await User.find({
      role: 'parent',
      status: "active",
      username: { $regex: fullName, $options: 'i' }
    }).select('-password');
    res.json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const parent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'parent', status: "active" },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.deleteParent = async (req, res) => {
//   try {
//     const parent = await User.findOneAndDelete({ _id: req.params.id, role: 'parent' });
//     if (!parent) return res.status(404).json({ error: 'Parent not found' });
//     res.json({ message: 'Parent deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// Soft delete parent - chỉ đổi status
exports.deleteParent = async (req, res) => {
  try {
    const parent = await User.findOneAndUpdate(
      { _id: req.params.id, role: "parent" },
      { status: "inactive" },
      { new: true }
    );
    
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    
    res.json({ 
      message: "Parent đã được vô hiệu hóa thành công",
      data: parent 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Khôi phục parent
exports.restoreParent = async (req, res) => {
  try {
    const parent = await User.findOneAndUpdate(
      { _id: req.params.id, role: "parent" },
      { status: "active" },
      { new: true }
    );
    
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    
    res.json({ 
      message: "Parent đã được khôi phục thành công",
      data: parent 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const parent = await User.findById(req.user.id).select('-password');
    if (!parent || parent.role !== 'parent') return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const parent = await User.findOneAndUpdate(
      { _id: req.user.id, role: 'parent' },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createParent = async (req, res) => {
  try {
    const parent = await User.create({ ...req.body, role: 'parent' });
    res.status(201).json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.getMyChildren = async (req, res) => {
  try {
    // Lấy tất cả học sinh của parent đã đăng nhập
    const children = await Student.find({ 
      parentId: req.user.id 
    })
    .populate('classId', 'name capacity') // Lấy thông tin lớp học
    .select('fullName birthdate gender classId createdAt');
    
    // Chỉ lấy các con đã được xếp lớp (đã duyệt)
    const approvedChildren = children.filter(child => child.classId !== null);
    
    res.json({
      success: true,
      count: approvedChildren.length,
      data: approvedChildren
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};