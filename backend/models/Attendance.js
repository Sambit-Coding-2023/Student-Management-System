const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  period: {
    type: Number,
    min: 1,
    max: 8
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: String,
  remarks: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ 
  student: 1, 
  class: 1, 
  subject: 1, 
  date: 1, 
  period: 1 
}, { unique: true });

// Index for better performance
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
