const express = require('express');
const User = require('../models/User');
const Class = require('../models/Class');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users with filtering and pagination
// @route   GET /api/users
// @access  Private (Admin, Teacher)
router.get('/', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const {
    role,
    search,
    class: classId,
    page = 1,
    limit = 10,
    sort = 'firstName'
  } = req.query;

  // Build filter object
  const filter = {};
  if (role) filter.role = role;
  if (classId) filter.class = classId;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  // For teachers, only show students in their classes
  if (req.user.role === 'teacher') {
    const teacherClasses = await Class.find({ 
      $or: [
        { classTeacher: req.user._id },
        { 'subjects.teacher': req.user._id }
      ]
    }).select('_id');
    
    const classIds = teacherClasses.map(c => c._id);
    filter.class = { $in: classIds };
    filter.role = 'student'; // Teachers can only see students
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sort,
    populate: [
      { path: 'class', select: 'name grade section' },
      { path: 'parentId', select: 'firstName lastName email phone' },
      { path: 'subjects', select: 'name code' }
    ],
    select: '-password'
  };

  const users = await User.find(filter)
    .populate([
      { path: 'class', select: 'name grade section' },
      { path: 'parentId', select: 'firstName lastName email phone' },
      { path: 'subjects', select: 'name code' }
    ])
    .select('-password')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    totalUsers: total,
    hasNext: page * limit < total,
    hasPrev: page > 1
  });
}));

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', checkOwnership(), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('class', 'name grade section classTeacher')
    .populate('parentId', 'firstName lastName email phone')
    .populate('children', 'firstName lastName email studentId class')
    .populate('subjects', 'name code description')
    .select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
}));

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    address,
    dateOfBirth,
    gender,
    class: classId,
    parentId,
    department,
    qualification,
    experience,
    subjects
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  // Generate student/employee ID based on role
  let idField = {};
  if (role === 'student') {
    const studentCount = await User.countDocuments({ role: 'student' });
    idField.studentId = `STU${new Date().getFullYear()}${String(studentCount + 1).padStart(4, '0')}`;
    idField.enrollmentDate = new Date();
  } else if (role === 'teacher') {
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    idField.employeeId = `EMP${new Date().getFullYear()}${String(teacherCount + 1).padStart(4, '0')}`;
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    address,
    dateOfBirth,
    gender,
    class: classId,
    parentId,
    department,
    qualification,
    experience,
    subjects,
    ...idField
  });

  await user.save();

  // If creating a student, update the class
  if (role === 'student' && classId) {
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: user._id }
    });
  }

  // If creating a parent, update children's parentId
  if (role === 'parent' && req.body.children) {
    await User.updateMany(
      { _id: { $in: req.body.children } },
      { parentId: user._id }
    );
    user.children = req.body.children;
    await user.save();
  }

  const populatedUser = await User.findById(user._id)
    .populate('class', 'name grade section')
    .populate('parentId', 'firstName lastName email')
    .populate('subjects', 'name code')
    .select('-password');

  res.status(201).json({
    message: 'User created successfully',
    user: populatedUser
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or self)
router.put('/:id', asyncHandler(async (req, res) => {
  // Check permissions
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const {
    firstName,
    lastName,
    phone,
    address,
    dateOfBirth,
    gender,
    class: classId,
    parentId,
    department,
    qualification,
    experience,
    subjects,
    isActive
  } = req.body;

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (gender) user.gender = gender;
  
  // Admin-only fields
  if (req.user.role === 'admin') {
    if (classId !== undefined) {
      // Remove from old class if exists
      if (user.class) {
        await Class.findByIdAndUpdate(user.class, {
          $pull: { students: user._id }
        });
      }
      
      // Add to new class
      if (classId) {
        await Class.findByIdAndUpdate(classId, {
          $addToSet: { students: user._id }
        });
      }
      
      user.class = classId;
    }
    
    if (parentId !== undefined) user.parentId = parentId;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Teacher-specific fields
    if (user.role === 'teacher') {
      if (department) user.department = department;
      if (qualification) user.qualification = qualification;
      if (experience !== undefined) user.experience = experience;
      if (subjects) user.subjects = subjects;
    }
  }

  await user.save();

  const updatedUser = await User.findById(user._id)
    .populate('class', 'name grade section')
    .populate('parentId', 'firstName lastName email')
    .populate('subjects', 'name code')
    .select('-password');

  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Remove user from class if student
  if (user.role === 'student' && user.class) {
    await Class.findByIdAndUpdate(user.class, {
      $pull: { students: user._id }
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ message: 'User deleted successfully' });
}));

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private (Admin, Teacher)
router.get('/role/:role', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { search, limit = 50 } = req.query;

  const filter = { role };
  
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .limit(parseInt(limit))
    .select('firstName lastName email studentId employeeId')
    .sort('firstName');

  res.json({ users });
}));

// @desc    Get student's parent
// @route   GET /api/users/:id/parent
// @access  Private
router.get('/:id/parent', asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id).populate('parentId', '-password');
  
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (!student.parentId) {
    return res.status(404).json({ message: 'Parent not found' });
  }

  res.json({ parent: student.parentId });
}));

// @desc    Get parent's children
// @route   GET /api/users/:id/children
// @access  Private
router.get('/:id/children', asyncHandler(async (req, res) => {
  const parent = await User.findById(req.params.id).populate('children', '-password');
  
  if (!parent) {
    return res.status(404).json({ message: 'Parent not found' });
  }

  res.json({ children: parent.children });
}));

module.exports = router;
