const express = require('express');
const Class = require('../models/Class');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { 
    grade, 
    academicYear = new Date().getFullYear(),
    search,
    page = 1,
    limit = 10 
  } = req.query;

  const filter = { academicYear };
  
  if (grade) filter.grade = grade;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { grade: { $regex: search, $options: 'i' } },
      { section: { $regex: search, $options: 'i' } }
    ];
  }

  // For teachers, only show their assigned classes
  if (req.user.role === 'teacher') {
    filter.$or = [
      { classTeacher: req.user._id },
      { 'subjects.teacher': req.user._id }
    ];
  }

  const skip = (page - 1) * limit;
  
  const classes = await Class.find(filter)
    .populate('classTeacher', 'firstName lastName email employeeId')
    .populate('subjects.subject', 'name code')
    .populate('subjects.teacher', 'firstName lastName')
    .populate('students', 'firstName lastName studentId')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('grade section');

  const total = await Class.countDocuments(filter);

  res.json({
    classes,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    totalClasses: total
  });
}));

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id)
    .populate('classTeacher', 'firstName lastName email phone employeeId')
    .populate('subjects.subject', 'name code description credits')
    .populate('subjects.teacher', 'firstName lastName email employeeId')
    .populate('students', 'firstName lastName email studentId dateOfBirth gender phone');

  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  // Check permissions
  if (req.user.role === 'teacher') {
    const isAuthorized = classData.classTeacher._id.toString() === req.user._id.toString() ||
                        classData.subjects.some(s => s.teacher._id.toString() === req.user._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  res.json({ class: classData });
}));

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin only)
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const {
    name,
    grade,
    section,
    academicYear,
    classTeacher,
    subjects,
    capacity,
    room,
    schedule
  } = req.body;

  // Check if class already exists
  const existingClass = await Class.findOne({
    grade,
    section,
    academicYear
  });

  if (existingClass) {
    return res.status(400).json({ 
      message: 'Class already exists for this grade, section, and academic year' 
    });
  }

  // Verify class teacher exists and is a teacher
  const teacher = await User.findById(classTeacher);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(400).json({ message: 'Invalid class teacher' });
  }

  const newClass = new Class({
    name,
    grade,
    section,
    academicYear,
    classTeacher,
    subjects: subjects || [],
    capacity,
    room,
    schedule: schedule || []
  });

  await newClass.save();

  const populatedClass = await Class.findById(newClass._id)
    .populate('classTeacher', 'firstName lastName email')
    .populate('subjects.subject', 'name code')
    .populate('subjects.teacher', 'firstName lastName');

  res.status(201).json({
    message: 'Class created successfully',
    class: populatedClass
  });
}));

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id);
  
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  const {
    name,
    classTeacher,
    subjects,
    capacity,
    room,
    schedule,
    isActive
  } = req.body;

  // Update fields
  if (name) classData.name = name;
  if (classTeacher) {
    // Verify new class teacher
    const teacher = await User.findById(classTeacher);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid class teacher' });
    }
    classData.classTeacher = classTeacher;
  }
  if (subjects) classData.subjects = subjects;
  if (capacity) classData.capacity = capacity;
  if (room) classData.room = room;
  if (schedule) classData.schedule = schedule;
  if (isActive !== undefined) classData.isActive = isActive;

  await classData.save();

  const updatedClass = await Class.findById(classData._id)
    .populate('classTeacher', 'firstName lastName email')
    .populate('subjects.subject', 'name code')
    .populate('subjects.teacher', 'firstName lastName')
    .populate('students', 'firstName lastName studentId');

  res.json({
    message: 'Class updated successfully',
    class: updatedClass
  });
}));

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id);
  
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  // Remove class reference from students
  await User.updateMany(
    { class: req.params.id },
    { $unset: { class: 1 } }
  );

  await Class.findByIdAndDelete(req.params.id);

  res.json({ message: 'Class deleted successfully' });
}));

// @desc    Add student to class
// @route   POST /api/classes/:id/students
// @access  Private (Admin only)
router.post('/:id/students', authorize('admin'), asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  
  const classData = await Class.findById(req.params.id);
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  // Verify students exist and are students
  const students = await User.find({
    _id: { $in: studentIds },
    role: 'student'
  });

  if (students.length !== studentIds.length) {
    return res.status(400).json({ message: 'One or more invalid student IDs' });
  }

  // Check capacity
  if (classData.students.length + studentIds.length > classData.capacity) {
    return res.status(400).json({ 
      message: `Class capacity exceeded. Available spots: ${classData.capacity - classData.students.length}` 
    });
  }

  // Add students to class
  classData.students.push(...studentIds);
  await classData.save();

  // Update students' class reference
  await User.updateMany(
    { _id: { $in: studentIds } },
    { class: classData._id }
  );

  const updatedClass = await Class.findById(classData._id)
    .populate('students', 'firstName lastName studentId');

  res.json({
    message: 'Students added to class successfully',
    class: updatedClass
  });
}));

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin only)
router.delete('/:id/students/:studentId', authorize('admin'), asyncHandler(async (req, res) => {
  const { id: classId, studentId } = req.params;
  
  const classData = await Class.findById(classId);
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  // Remove student from class
  classData.students.pull(studentId);
  await classData.save();

  // Remove class reference from student
  await User.findByIdAndUpdate(studentId, { $unset: { class: 1 } });

  res.json({ message: 'Student removed from class successfully' });
}));

// @desc    Add subject to class
// @route   POST /api/classes/:id/subjects
// @access  Private (Admin only)
router.post('/:id/subjects', authorize('admin'), asyncHandler(async (req, res) => {
  const { subjectId, teacherId } = req.body;
  
  const classData = await Class.findById(req.params.id);
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  // Verify subject and teacher exist
  const subject = await Subject.findById(subjectId);
  const teacher = await User.findById(teacherId);

  if (!subject) {
    return res.status(400).json({ message: 'Subject not found' });
  }

  if (!teacher || teacher.role !== 'teacher') {
    return res.status(400).json({ message: 'Invalid teacher' });
  }

  // Check if subject already assigned to this class
  const existingSubject = classData.subjects.find(s => 
    s.subject.toString() === subjectId
  );

  if (existingSubject) {
    return res.status(400).json({ message: 'Subject already assigned to this class' });
  }

  classData.subjects.push({ subject: subjectId, teacher: teacherId });
  await classData.save();

  // Add subject to teacher's subjects if not already there
  if (!teacher.subjects.includes(subjectId)) {
    teacher.subjects.push(subjectId);
    await teacher.save();
  }

  const updatedClass = await Class.findById(classData._id)
    .populate('subjects.subject', 'name code')
    .populate('subjects.teacher', 'firstName lastName');

  res.json({
    message: 'Subject added to class successfully',
    class: updatedClass
  });
}));

// @desc    Update class schedule
// @route   PUT /api/classes/:id/schedule
// @access  Private (Admin only)
router.put('/:id/schedule', authorize('admin'), asyncHandler(async (req, res) => {
  const { schedule } = req.body;
  
  const classData = await Class.findById(req.params.id);
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  classData.schedule = schedule;
  await classData.save();

  const updatedClass = await Class.findById(classData._id)
    .populate('schedule.periods.subject', 'name code')
    .populate('schedule.periods.teacher', 'firstName lastName');

  res.json({
    message: 'Class schedule updated successfully',
    class: updatedClass
  });
}));

// @desc    Get class statistics
// @route   GET /api/classes/:id/stats
// @access  Private
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id)
    .populate('students');

  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }

  // Check permissions
  if (req.user.role === 'teacher') {
    const isAuthorized = classData.classTeacher.toString() === req.user._id.toString() ||
                        classData.subjects.some(s => s.teacher.toString() === req.user._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  const stats = {
    totalStudents: classData.students.length,
    capacity: classData.capacity,
    occupancyRate: (classData.students.length / classData.capacity) * 100,
    totalSubjects: classData.subjects.length,
    maleStudents: classData.students.filter(s => s.gender === 'male').length,
    femaleStudents: classData.students.filter(s => s.gender === 'female').length
  };

  res.json({ stats });
}));

module.exports = router;
