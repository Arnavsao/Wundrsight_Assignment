const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const { authenticateToken, requireAdmin, requirePatient } = require('../middleware/auth');
const { validateBooking, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

router.post('/book', authenticateToken, requirePatient, sanitizeInput, validateBooking, async (req, res) => {
  try {
    const { slotId } = req.body;
    const userId = req.user._id;
    
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        error: {
          code: 'SLOT_NOT_FOUND',
          message: 'Time slot not found'
        }
      });
    }
    
    if (slot.isBooked) {
      return res.status(409).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This time slot is already booked'
        }
      });
    }
    
    if (slot.startAt <= new Date()) {
      return res.status(400).json({
        error: {
          code: 'SLOT_IN_PAST',
          message: 'Cannot book slots in the past'
        }
      });
    }
    
    const existingBooking = await Booking.findBySlot(slotId);
    if (existingBooking) {
      return res.status(409).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This time slot is already booked'
        }
      });
    }
    
    const booking = new Booking({
      userId,
      slotId
    });
    
    await booking.save();
    
    await booking.populate('slot user');
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      data: {
        booking: {
          id: booking._id,
          userId: booking.userId,
          slotId: booking.slotId,
          status: booking.status,
          createdAt: booking.createdAt,
          slot: {
            id: booking.slot._id,
            startAt: booking.slot.startAt,
            endAt: booking.slot.endAt,
            formattedTime: {
              start: booking.slot.startAt.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              end: booking.slot.endAt.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              date: booking.slot.startAt.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Booking error:', error);
    
    if (error.message === 'Slot is already booked') {
      return res.status(409).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This time slot is already booked'
        }
      });
    }
    
    res.status(500).json({
      error: {
        code: 'BOOKING_FAILED',
        message: 'Failed to book appointment'
      }
    });
  }
});

router.get('/my-bookings', authenticateToken, requirePatient, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const bookings = await Booking.findByUser(userId);
    
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      status: booking.status,
      createdAt: booking.createdAt,
      slot: {
        id: booking.slot._id,
        startAt: booking.slot.startAt,
        endAt: booking.slot.endAt,
        formattedTime: {
          start: booking.slot.startAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          end: booking.slot.endAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          date: booking.slot.startAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      }
    }));
    
    res.json({
      message: 'User bookings retrieved successfully',
      data: {
        bookings: formattedBookings,
        count: formattedBookings.length
      }
    });
    
  } catch (error) {
    console.error('Error retrieving user bookings:', error);
    res.status(500).json({
      error: {
        code: 'BOOKINGS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve user bookings'
      }
    });
  }
});

router.get('/all-bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAllBookings();
    
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      status: booking.status,
      createdAt: booking.createdAt,
      user: {
        id: booking.user._id,
        name: booking.user.name,
        email: booking.user.email,
        role: booking.user.role
      },
      slot: {
        id: booking.slot._id,
        startAt: booking.slot.startAt,
        endAt: booking.slot.endAt,
        formattedTime: {
          start: booking.slot.startAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          end: booking.slot.endAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          date: booking.slot.startAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      }
    }));
    
    res.json({
      message: 'All bookings retrieved successfully',
      data: {
        bookings: formattedBookings,
        count: formattedBookings.length
      }
    });
    
  } catch (error) {
    console.error('Error retrieving all bookings:', error);
    res.status(500).json({
      error: {
        code: 'BOOKINGS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve all bookings'
      }
    });
  }
});

router.delete('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }
    
    if (booking.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only cancel your own bookings'
        }
      });
    }
    
    await booking.cancel();
    
    res.json({
      message: 'Booking cancelled successfully',
      data: {
        booking: {
          id: booking._id,
          status: booking.status
        }
      }
    });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      error: {
        code: 'CANCELLATION_FAILED',
        message: 'Failed to cancel booking'
      }
    });
  }
});

router.patch('/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be one of: confirmed, cancelled, completed'
        }
      });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({
      message: 'Booking status updated successfully',
      data: {
        booking: {
          id: booking._id,
          status: booking.status
        }
      }
    });
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      error: {
        code: 'STATUS_UPDATE_FAILED',
        message: 'Failed to update booking status'
      }
    });
  }
});

module.exports = router;
