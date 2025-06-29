const express = require('express');
const Grade = require('../models/Grade');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Add grade
router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const grade = new Grade({
    ...req.body,
    teacher: req.user._id
  });
  
  await grade.save();
  
  const populatedGrade = await Grade.findById(grade._id)
    .populate('student', 'firstName lastName studentId')
    .populate('subject', 'name code')
    .populate('class', 'name grade section');

  res.status(201).json({ message: 'Grade added successfully', grade: populatedGrade });
}));

// Get grades for a student
router.get('/student/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subjectId, examType, academicYear } = req.query;

  const filter = { student: studentId, isPublished: true };
  
  if (subjectId) filter.subject = subjectId;
  if (examType) filter.examType = examType;

  const grades = await Grade.find(filter)
    .populate('subject', 'name code credits')
    .populate('teacher', 'firstName lastName')
    .sort({ examDate: -1 });

  // Calculate GPA
  const totalCredits = grades.reduce((sum, grade) => sum + (grade.subject.credits || 1), 0);
  const totalGradePoints = grades.reduce((sum, grade) => sum + (grade.gpa * (grade.subject.credits || 1)), 0);
  const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  res.json({ grades, overallGPA });
}));

// Get grades for a class
router.get('/class/:classId', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { subjectId, examType } = req.query;

  const filter = { class: classId };
  
  if (subjectId) filter.subject = subjectId;
  if (examType) filter.examType = examType;

  const grades = await Grade.find(filter)
    .populate('student', 'firstName lastName studentId')
    .populate('subject', 'name code')
    .sort({ examDate: -1 });

  res.json({ grades });
}));

// Update grade
router.put('/:id', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id);
  
  if (!grade) {
    return res.status(404).json({ message: 'Grade not found' });
  }

  // Teachers can only update their own grades
  if (req.user.role === 'teacher' && grade.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  Object.assign(grade, req.body);
  await grade.save();

  const updatedGrade = await Grade.findById(grade._id)
    .populate('student', 'firstName lastName studentId')
    .populate('subject', 'name code')
    .populate('class', 'name grade section');

  res.json({ message: 'Grade updated successfully', grade: updatedGrade });
}));

module.exports = router;
