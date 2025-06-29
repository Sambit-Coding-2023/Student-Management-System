const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    required: true,
    enum: ['tuition', 'library', 'lab', 'sports', 'transport', 'exam', 'admission', 'other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidDate: Date,
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'cheque', 'online']
  },
  transactionId: String,
  receiptNumber: String,
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  remarks: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Update status based on payment
feeSchema.pre('save', function(next) {
  const totalAmount = this.amount - this.discount;
  
  if (this.paidAmount === 0) {
    this.status = new Date() > this.dueDate ? 'overdue' : 'pending';
  } else if (this.paidAmount >= totalAmount) {
    this.status = 'paid';
  } else {
    this.status = 'partial';
  }
  
  next();
});

// Index for better performance
feeSchema.index({ student: 1, academicYear: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ status: 1 });

module.exports = mongoose.model('Fee', feeSchema);
