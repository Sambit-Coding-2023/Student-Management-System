const express = require('express');
const Fee = require('../models/Fee');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Create fee record
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const fee = new Fee({
    ...req.body,
    createdBy: req.user._id
  });
  
  await fee.save();
  
  const populatedFee = await Fee.findById(fee._id)
    .populate('student', 'firstName lastName studentId class');

  res.status(201).json({ message: 'Fee record created successfully', fee: populatedFee });
}));

// Get fees for a student
router.get('/student/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear, status } = req.query;

  const filter = { student: studentId };
  
  if (academicYear) filter.academicYear = academicYear;
  if (status) filter.status = status;

  const fees = await Fee.find(filter)
    .sort({ dueDate: -1 });

  // Calculate totals
  const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  res.json({ 
    fees, 
    summary: { totalAmount, totalPaid, totalPending }
  });
}));

// Record payment
router.post('/:id/payment', authorize('admin'), asyncHandler(async (req, res) => {
  const { amount, paymentMethod, transactionId, receiptNumber } = req.body;
  
  const fee = await Fee.findById(req.params.id);
  if (!fee) {
    return res.status(404).json({ message: 'Fee record not found' });
  }

  fee.paidAmount += amount;
  fee.paidDate = new Date();
  fee.paymentMethod = paymentMethod;
  fee.transactionId = transactionId;
  fee.receiptNumber = receiptNumber;

  await fee.save();

  res.json({ message: 'Payment recorded successfully', fee });
}));

module.exports = router;
