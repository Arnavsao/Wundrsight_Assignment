const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');


const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/wundrsight-test';

describe('Wundrsight API Tests', () => {
  let testUser;
  let testSlot;
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(TEST_MONGODB_URI);
    
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
  });

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('User Registration', () => {
    test('POST /api/register should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('patient');
      expect(response.body.data.token).toBeDefined();
    });

    test('POST /api/register should fail with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      });
      await testUser.save();
    });

    test('POST /api/login should authenticate valid user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.role).toBe('patient');
    });

    test('POST /api/login should fail with wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Slot Management', () => {
    beforeEach(async () => {
      const now = new Date();
      testSlot = new Slot({
        startAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Tomorrow + 30 min
        isBooked: false
      });
      await testSlot.save();
    });

    test('GET /api/slots should return available slots', async () => {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 7);

      const response = await request(app)
        .get(`/api/slots?from=${from.toISOString()}&to=${to.toISOString()}`);

      expect(response.status).toBe(200);
      expect(response.body.data.slots).toBeDefined();
      expect(Array.isArray(response.body.data.slots)).toBe(true);
    });
  });

  describe('Booking Management', () => {
    beforeEach(async () => {      
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      });
      await testUser.save();

      const now = new Date();
      testSlot = new Slot({
        startAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        isBooked: false
      });
      await testSlot.save();

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!'
        });
      
      authToken = loginResponse.body.data.token;
    });

    test('POST /api/book should create a new booking', async () => {
      const bookingData = {
        slotId: testSlot._id.toString()
      };

      const response = await request(app)
        .post('/api/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.data.booking.slotId).toBe(bookingData.slotId);
      expect(response.body.data.booking.status).toBe('confirmed');
    });

    test('GET /api/my-bookings should return user bookings', async () => {
      const booking = new Booking({
        userId: testUser._id,
        slotId: testSlot._id
      });
      await booking.save();

      const response = await request(app)
        .get('/api/my-bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.bookings).toBeDefined();
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
      expect(response.body.data.bookings.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('Should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('Should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/register')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });
});
