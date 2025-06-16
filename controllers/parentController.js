const User = require('../models/User');

exports.getParents = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' }).select('-password');
    res.json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parent = await User.findOne({ _id: req.params.id, role: 'parent' }).select('-password');
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
      { _id: req.params.id, role: 'parent' },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parent = await User.findOneAndDelete({ _id: req.params.id, role: 'parent' });
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json({ message: 'Parent deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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