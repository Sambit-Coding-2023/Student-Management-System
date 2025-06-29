const express = require('express');
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Fee = require('../models/Fee');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  let stats = {};

  if (req.user.role === 'admin') {
    // Admin dashboard
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const totalClasses = await Class.countDocuments({ academicYear, isActive: true });
    
    // Today's attendance
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999));
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const presentToday = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'present'
    });

    stats = {
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance,
      presentToday,
      attendanceRate: todayAttendance > 0 ? (presentToday / todayAttendance) * 100 : 0
    };

  } else if (req.user.role === 'teacher') {
    // Teacher dashboard
    const teacherClasses = await Class.find({
      $or: [
        { classTeacher: req.user._id },
        { 'subjects.teacher': req.user._id }
      ]
    });

    const classIds = teacherClasses.map(c => c._id);
    const myStudents = await User.countDocuments({ 
      class: { $in: classIds }, 
      role: 'student' 
    });

    stats = {
      myClasses: teacherClasses.length,
      myStudents,
      mySubjects: req.user.subjects?.length || 0
    };

  } else if (req.user.role === 'student') {
    // Student dashboard
    const myGrades = await Grade.find({ 
      student: req.user._id, 
      isPublished: true 
    }).populate('subject', 'credits');

    const totalCredits = myGrades.reduce((sum, grade) => sum + (grade.subject.credits || 1), 0);
    const totalGradePoints = myGrades.reduce((sum, grade) => sum + (grade.gpa * (grade.subject.credits || 1)), 0);
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Attendance this month
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthlyAttendance = await Attendance.find({
      student: req.user._id,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
    const attendanceRate = monthlyAttendance.length > 0 ? (presentDays / monthlyAttendance.length) * 100 : 0;

    stats = {
      currentGPA: gpa.toFixed(2),
      totalGrades: myGrades.length,
      attendanceRate: attendanceRate.toFixed(1),
      monthlyAttendance: monthlyAttendance.length
    };
  }

  res.json({ stats });
}));

// Get recent activities
router.get('/activities', asyncHandler(async (req, res) => {
  let activities = [];

  if (req.user.role === 'student') {
    // Recent grades
    const recentGrades = await Grade.find({ 
      student: req.user._id, 
      isPublished: true 
    })
    .populate('subject', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    activities = recentGrades.map(grade => ({
      type: 'grade',
      title: `New grade for ${grade.subject.name}`,
      description: `${grade.grade} (${grade.percentage.toFixed(1)}%)`,
      date: grade.createdAt
    }));
  }

  res.json({ activities });
}));

module.exports = router;
