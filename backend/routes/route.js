import { Router } from 'express';
const router = Router();

import { register, login, sendOtpToUser, verifyOtp } from '../controllers/AuthConrtroller.js';
import { authenticate } from '../middleware/auth.js';

import { getAllRides } from '../controllers/CreateRide.js';
import { createRide } from '../controllers/CreateRide.js';
// import {driverRides} from '../controllers/DriverController.js';

import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from '../controllers/Booking.js';

import {  approveRideRequest, getDriverBookings } from '../controllers/DriverController.js';
import { getApprovedRides, getPendingRequests } from '../controllers/passengerController.js';

// 🔐 Auth Routes

router.post('/register', register);
router.post('/login', login);

// OTP Routes
router.post('/send-otp', sendOtpToUser);
router.post('/verify-otp', verifyOtp);

router.post('/create-ride', createRide);
router.get('/rides',getAllRides);

// Driver Routes
// router.get('/driver/rides', authenticate, getDriverRides);
// router.post('/driver/rides/:rideId/approve', authenticate, approveRideRequest);
router.post('/driver/bookings', authenticate, getDriverBookings);
router.patch('/bookings/:id',authenticate,approveRideRequest);
// router.get('/driverRides',authenticate,driverRides);

// 📦 Booking Routes
router.post('/bookings/:rideId', createBooking);
router.get('/bookings', authenticate, getAllBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id', authenticate, updateBooking);
router.delete('/bookings/:id', authenticate, deleteBooking);

/// Passenger Routes
router.get('/pendingRides',authenticate,getPendingRequests);
router.get('/approvedRides',authenticate , getApprovedRides);

export default router;
