const express = require('express');
const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Create event
router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const event = new Event({
    ...req.body,
    organizer: req.user._id
  });
  
  await event.save();
  res.status(201).json({ message: 'Event created successfully', event });
}));

// Get events
router.get('/', asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;

  const filter = { isActive: true };
  
  if (startDate && endDate) {
    filter.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (type) filter.type = type;

  const events = await Event.find(filter)
    .populate('organizer', 'firstName lastName')
    .sort({ startDate: 1 });

  res.json({ events });
}));

// Update event
router.put('/:id', authorize('admin', 'teacher'), asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (req.user.role === 'teacher' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  Object.assign(event, req.body);
  await event.save();

  res.json({ message: 'Event updated successfully', event });
}));

module.exports = router;
