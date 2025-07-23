const Children = require('../models/Children');

// Create a new child
exports.createChild = async (req, res) => {
  try {
    const { fullName, birthdate, gender, address, parent, image } = req.body;
    const child = await Children.create({ fullName, birthdate, gender, address, parent, image });
    res.status(201).json(child);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all children
exports.getAllChildren = async (req, res) => {
  try {
    const children = await Children.find().populate('parent', 'username email');
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a child by ID
exports.getChildById = async (req, res) => {
  try {
    const child = await Children.findById(req.params.id).populate('parent', 'username email');
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a child by ID
exports.updateChild = async (req, res) => {
  try {
    const { fullName, birthdate, gender, address, parent, image } = req.body;
    const child = await Children.findByIdAndUpdate(
      req.params.id,
      { fullName, birthdate, gender, address, parent, image },
      { new: true, runValidators: true }
    );
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json(child);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a child by ID
exports.deleteChild = async (req, res) => {
  try {
    const child = await Children.findByIdAndDelete(req.params.id);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json({ message: 'Child deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 

// Get children by parentId
exports.getChildrenByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    const children = await Children.find({ parent: parentId }).populate('parent', 'username email');
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
