const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ slotId: 1, status: 1 });

bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('slot', {
  ref: 'Slot',
  localField: 'slotId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

bookingSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('slot', 'startAt endAt')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

bookingSchema.statics.findAllBookings = function() {
  return this.find({})
    .populate('slot', 'startAt endAt')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
};

bookingSchema.statics.findBySlot = function(slotId) {
  return this.findOne({ slotId });
};

bookingSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  
  const Slot = mongoose.model('Slot');
  await Slot.findByIdAndUpdate(this.slotId, { isBooked: false });
  
  return this.save();
};

bookingSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Slot = mongoose.model('Slot');
    
    const slot = await Slot.findById(this.slotId);
    if (!slot) {
      return next(new Error('Slot not found'));
    }
    
    if (slot.isBooked) {
      return next(new Error('Slot is already booked'));
    }
    
    slot.isBooked = true;
    await slot.save();
  }
  
  next();
});

bookingSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const Slot = mongoose.model('Slot');
  
  await Slot.findByIdAndUpdate(this.slotId, { isBooked: false });
  
  next();
});

bookingSchema.pre('deleteMany', async function(next) {
  const Slot = mongoose.model('Slot');
  
  const bookings = await this.model.find(this.getFilter());
  const slotIds = bookings.map(booking => booking.slotId);
      
  if (slotIds.length > 0) {
    await Slot.updateMany(
      { _id: { $in: slotIds } },
      { isBooked: false }
    );
  }
  
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
