const express = require('express');
const Subject = require('../models/Subject');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', asyncHandler(async (req, res) => {
  const { grade, search, department } = req.query;
  const filter = {};
  
  if (grade) filter.grade = grade;
  if (department) filter.department = department;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const subjects = await Subject.find(filter).sort('name');
  res.json({ subjects });
}));

// Get subject by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  res.json({ subject });
}));

// Create subject (Admin only)
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const subject = new Subject(req.body);
  await subject.save();
  res.status(201).json({ message: 'Subject created successfully', subject });
}));

// Update subject (Admin only)
router.put('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  res.json({ message: 'Subject updated successfully', subject });
}));

// Delete subject (Admin only)
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  res.json({ message: 'Subject deleted successfully' });
}));

module.exports = router;
