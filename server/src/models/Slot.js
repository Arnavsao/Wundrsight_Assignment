const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startAt: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endAt: {
    type: Date,
    required: [true, 'End time is required']
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient slot queries
slotSchema.index({ startAt: 1, endAt: 1 });
slotSchema.index({ startAt: 1, isBooked: 1 });

// Virtual for slot duration in minutes
slotSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.endAt - this.startAt) / (1000 * 60));
});

// Ensure virtuals are serialized
slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

// Static method to find available slots in date range
slotSchema.statics.findAvailableSlots = function(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  return this.find({
    startAt: { $gte: from, $lte: to },
    isBooked: false
  }).sort({ startAt: 1 });
};

// Static method to find slot by time range
slotSchema.statics.findByTimeRange = function(startAt, endAt) {
  return this.findOne({
    startAt: startAt,
    endAt: endAt
  });
};

// Instance method to mark as booked
slotSchema.methods.markAsBooked = function() {
  this.isBooked = true;
  return this.save();
};

// Instance method to mark as available
slotSchema.methods.markAsAvailable = function() {
  this.isBooked = false;
  return this.save();
};

// Validation: end time must be after start time
slotSchema.pre('save', function(next) {
  if (this.startAt >= this.endAt) {
    return next(new Error('End time must be after start time'));
  }
  
  // Ensure slots are 30 minutes apart
  const durationMs = this.endAt - this.startAt;
  const durationMinutes = durationMs / (1000 * 60);
  
  if (durationMinutes !== 30) {
    return next(new Error('Slots must be exactly 30 minutes long'));
  }
  
  next();
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
