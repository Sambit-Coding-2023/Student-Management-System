const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['quiz', 'assignment', 'midterm', 'final', 'project', 'practical']
  },
  examName: {
    type: String,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4
  },
  examDate: {
    type: Date,
    required: true
  },
  submissionDate: Date,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: String,
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate percentage and grade before saving
gradeSchema.pre('save', function(next) {
  this.percentage = (this.obtainedMarks / this.maxMarks) * 100;
  
  // Calculate grade based on percentage
  if (this.percentage >= 95) this.grade = 'A+';
  else if (this.percentage >= 90) this.grade = 'A';
  else if (this.percentage >= 85) this.grade = 'B+';
  else if (this.percentage >= 80) this.grade = 'B';
  else if (this.percentage >= 75) this.grade = 'C+';
  else if (this.percentage >= 70) this.grade = 'C';
  else if (this.percentage >= 60) this.grade = 'D';
  else this.grade = 'F';
  
  // Calculate GPA
  const gradePoints = {
    'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0,
    'C+': 2.7, 'C': 2.3, 'D': 2.0, 'F': 0.0
  };
  this.gpa = gradePoints[this.grade];
  
  next();
});

// Index for better performance
gradeSchema.index({ student: 1, subject: 1, examDate: 1 });
gradeSchema.index({ class: 1, examDate: 1 });
gradeSchema.index({ teacher: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
