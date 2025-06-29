const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  credits: {
    type: Number,
    default: 1
  },
  department: String,
  grade: {
    type: String,
    required: true
  },
  isCore: {
    type: Boolean,
    default: true
  },
  syllabus: String,
  books: [{
    title: String,
    author: String,
    isbn: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
subjectSchema.index({ code: 1 });
subjectSchema.index({ grade: 1 });
subjectSchema.index({ department: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
