const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Class = require('../models/Class');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Mark attendance
router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const { classId, subjectId, date, attendanceData, period } = req.body;

  const attendanceRecords = [];
  
  for (const record of attendanceData) {
    const attendance = new Attendance({
      student: record.studentId,
      class: classId,
      subject: subjectId,
      date: new Date(date),
      status: record.status,
      period,
      markedBy: req.user._id,
      reason: record.reason,
      remarks: record.remarks
    });

    try {
      await attendance.save();
      attendanceRecords.push(attendance);
    } catch (error) {
      if (error.code === 11000) {
        // Update existing record
        await Attendance.findOneAndUpdate(
          {
            student: record.studentId,
            class: classId,
            subject: subjectId,
            date: new Date(date),
            period
          },
          {
            status: record.status,
            reason: record.reason,
            remarks: record.remarks,
            markedBy: req.user._id
          }
        );
      }
    }
  }

  res.json({ message: 'Attendance marked successfully', records: attendanceRecords });
}));

// Get attendance for a class
router.get('/class/:classId', asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date, subjectId, startDate, endDate } = req.query;

  const filter = { class: classId };
  
  if (date) {
    filter.date = new Date(date);
  } else if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  if (subjectId) filter.subject = subjectId;

  const attendance = await Attendance.find(filter)
    .populate('student', 'firstName lastName studentId')
    .populate('subject', 'name code')
    .populate('markedBy', 'firstName lastName')
    .sort({ date: -1, period: 1 });

  res.json({ attendance });
}));

// Get student attendance
router.get('/student/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subjectId, startDate, endDate } = req.query;

  const filter = { student: studentId };
  
  if (subjectId) filter.subject = subjectId;
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const attendance = await Attendance.find(filter)
    .populate('subject', 'name code')
    .populate('class', 'name grade section')
    .sort({ date: -1 });

  // Calculate statistics
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  
  const stats = {
    total,
    present,
    absent,
    late,
    attendancePercentage: total > 0 ? ((present + late) / total) * 100 : 0
  };

  res.json({ attendance, stats });
}));

module.exports = router;
