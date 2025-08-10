const express = require('express');
const Slot = require('../models/Slot');
const { validateSlotQuery } = require('../middleware/validation');

const router = express.Router();

router.get('/slots', validateSlotQuery, async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate >= toDate) {
      return res.status(400).json({
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'From date must be before to date'
        }
      });
    }
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    
    if (toDate > maxDate) {
      return res.status(400).json({
        error: {
          code: 'DATE_RANGE_TOO_FAR',
          message: 'Cannot query slots more than 7 days in the future'
        }
      });
    }
    
    const slots = await Slot.findAvailableSlots(fromDate, toDate);
    
    const formattedSlots = slots.map(slot => ({
      id: slot._id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationMinutes: slot.durationMinutes,
      isBooked: slot.isBooked,
      formattedTime: {
        start: slot.startAt.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        end: slot.endAt.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        date: slot.startAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    }));
    
    res.json({
      message: 'Available slots retrieved successfully',
      data: {
        slots: formattedSlots,
        count: formattedSlots.length,
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving slots:', error);
    res.status(500).json({
      error: {
        code: 'SLOTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve available slots'
      }
    });
  }
});

router.get('/slots/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const slots = await Slot.findAvailableSlots(today, tomorrow);
    
    const formattedSlots = slots.map(slot => ({
      id: slot._id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationMinutes: slot.durationMinutes,
      isBooked: slot.isBooked,
      formattedTime: {
        start: slot.startAt.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        end: slot.endAt.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      }
    }));
    
    res.json({
      message: 'Today\'s slots retrieved successfully',
      data: {
        slots: formattedSlots,
        count: formattedSlots.length,
        date: today.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error retrieving today\'s slots:', error);
    res.status(500).json({
      error: {
        code: 'SLOTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve today\'s slots'
      }
    });
  }
});

router.get('/slots/next-week', async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    
    const slots = await Slot.findAvailableSlots(startDate, endDate);
    
    const slotsByDay = {};
    slots.forEach(slot => {
      const dateKey = slot.startAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!slotsByDay[dateKey]) {
        slotsByDay[dateKey] = [];
      }
      
      slotsByDay[dateKey].push({
        id: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        durationMinutes: slot.durationMinutes,
        isBooked: slot.isBooked,
        formattedTime: {
          start: slot.startAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          end: slot.endAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        }
      });
    });
    
    res.json({
      message: 'Next 7 days slots retrieved successfully',
      data: {
        slotsByDay,
        totalSlots: slots.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving next 7 days slots:', error);
    res.status(500).json({
      error: {
        code: 'SLOTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve next 7 days slots'
      }
    });
  }
});

router.get('/slots/week', async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const slots = await Slot.findAvailableSlots(startOfWeek, endOfWeek);
        
    const slotsByDay = {};
    slots.forEach(slot => {
      const dateKey = slot.startAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!slotsByDay[dateKey]) {
        slotsByDay[dateKey] = [];
      }
      
      slotsByDay[dateKey].push({
        id: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        durationMinutes: slot.durationMinutes,
        isBooked: slot.isBooked,
        formattedTime: {
          start: slot.startAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          end: slot.endAt.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        }
      });
    });
    
    res.json({
      message: 'This week\'s slots retrieved successfully',
      data: {
        slotsByDay,
        totalSlots: slots.length,
        weekRange: {
          start: startOfWeek.toISOString(),
          end: endOfWeek.toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving this week\'s slots:', error);
    res.status(500).json({
      error: {
        code: 'SLOTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve this week\'s slots'
      }
    });
  }
});

module.exports = router;
