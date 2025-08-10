const User = require('../models/User');
const Slot = require('../models/Slot');

// Generate time slots for the next 7 days
const generateSlots = async () => {
  try {
    // Check if slots already exist
    const existingSlots = await Slot.countDocuments();
    if (existingSlots > 0) {
      console.log('📅 Time slots already exist, skipping generation');
      return;
    }

    const slots = [];
    const now = new Date();
    
    // Generate slots for the next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() + day);
      
      // Set time to 9:00 AM
      currentDate.setHours(9, 0, 0, 0);
      
      // Generate 30-minute slots from 9:00 AM to 5:00 PM (16 slots per day)
      for (let slot = 0; slot < 16; slot++) {
        const startAt = new Date(currentDate);
        startAt.setMinutes(startAt.getMinutes() + (slot * 30));
        
        const endAt = new Date(startAt);
        endAt.setMinutes(endAt.getMinutes() + 30);
        
        slots.push({
          startAt,
          endAt,
          isBooked: false
        });
      }
    }
    
    // Insert all slots
    await Slot.insertMany(slots);
    console.log(`📅 Generated ${slots.length} time slots for the next 7 days`);
    
  } catch (error) {
    console.error('Error generating slots:', error);
    throw error;
  }
};

// Seed admin user
const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('👑 Admin user already exists, skipping creation');
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      name: process.env.ADMIN_NAME || 'Clinic Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'Passw0rd!',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('👑 Admin user created successfully');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Seed test patient user
const seedTestPatient = async () => {
  try {
    // Check if test patient already exists
    const existingPatient = await User.findOne({ email: 'patient@example.com' });
    if (existingPatient) {
      console.log('👤 Test patient already exists, skipping creation');
      return;
    }
    
    // Create test patient
    const testPatient = new User({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: 'Passw0rd!',
      role: 'patient'
    });
    
    await testPatient.save();
    console.log('👤 Test patient created successfully');
    
  } catch (error) {
    console.error('Error creating test patient:', error);
    throw error;
  }
};

// Clean up old slots (older than 7 days)
const cleanupOldSlots = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Slot.deleteMany({
      startAt: { $lt: sevenDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} old time slots`);
    }
    
  } catch (error) {
    console.error('Error cleaning up old slots:', error);
  }
};

// Main seeding function
const runSeeders = async () => {
  try {
    await seedAdminUser();
    await seedTestPatient();
    await generateSlots();
    console.log('✅ All seeders completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

module.exports = {
  generateSlots,
  seedAdminUser,
  seedTestPatient,
  cleanupOldSlots,
  runSeeders
};
