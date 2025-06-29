const express = require('express');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Create notification
router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const notification = new Notification({
    ...req.body,
    sender: req.user._id
  });
  
  await notification.save();
  res.status(201).json({ message: 'Notification created successfully', notification });
}));

// Get user notifications
router.get('/my', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const filter = {
    $or: [
      { 'recipients.user': req.user._id },
      { targetRoles: req.user.role },
      { targetStudents: req.user._id }
    ],
    isActive: true
  };

  if (unreadOnly === 'true') {
    filter['recipients.read'] = false;
  }

  const notifications = await Notification.find(filter)
    .populate('sender', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({ notifications });
}));

// Mark notification as read
router.put('/:id/read', asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, 'recipients.user': req.user._id },
    { 
      $set: { 
        'recipients.$.read': true,
        'recipients.$.readAt': new Date()
      }
    }
  );

  res.json({ message: 'Notification marked as read' });
}));

module.exports = router;
