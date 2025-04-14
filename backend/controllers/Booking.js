import prisma from '../config/db.config.js';

/**
 * Create a new booking
 */
export const createBooking = async (req, res) => {
  const { rideId } = req.params;
  const { passengerId, pickupLocation, pickupTime, baggageDetails } = req.body;

  console.log("Booking Params:", req.params);
  console.log("Booking Body:", req.body);

  try {
    // Validate ride
    const ride = await prisma.rideGiven.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No available seats for this ride' });
    }

    // Validate passenger
    const passenger = await prisma.user.findUnique({
      where: { id: passengerId },
    });

    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    // Validate and parse pickupTime
    const pickupDateTime = new Date(pickupTime);
    if (isNaN(pickupDateTime.getTime())) {
      return res.status(400).json({ message: 'Invalid pickup time format' });
    }

    // Calculate fare
    const fare = ride.price;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        rideId,
        passengerId,
        fare,
        Location:pickupLocation,  // Changed from pickupLocation to Location
        Time: pickupTime, // Now "Time" is a string
        status: "PENDING",
      },
      include: {
        ride: true,
        passenger: true,
      },
    });

    // Update available seats
    await prisma.rideGiven.update({
      where: { id: rideId },
      data: {
        availableSeats: ride.availableSeats - 1,
      },
    });

    // Optional baggage creation
    if (baggageDetails) {
      const { numberOfBags, totalWeight } = baggageDetails;

      if (
        typeof numberOfBags !== 'number' ||
        typeof totalWeight !== 'number' ||
        numberOfBags < 0 ||
        totalWeight < 0
      ) {
        return res.status(400).json({ message: 'Invalid baggage details' });
      }

      await prisma.baggage.create({
        data: {
          bookingId: booking.id,
          numberOfBags,
          totalWeight,
        },
      });
    }

    return res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
};



/**
 * Get all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        ride: true,
        passenger: true,
        baggage: true,
      },
    });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
};

/**
 * Get booking by ID
 */
 export const getBookingById  = async (req, res) => {
  const { rideId } = req.params;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        rideId,
        status: "PENDING",
      },
      include: {
        ride: true,
        passenger: true,
        baggage: true,
      },
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ error: 'No pending bookings found for this ride' });
    }

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
};

/**
 * Update a booking
 */
export const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status, fare, baggageDetails } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        fare,
        baggage: baggageDetails ? {
          update: {
            numberOfBags: baggageDetails.numberOfBags,
            totalWeight: baggageDetails.totalWeight,
            description: baggageDetails.description,
          },
        } : undefined,
      },
      include: {
        ride: true,
        passenger: true,
        baggage: true,
      },
    });

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.booking.delete({
      where: { id },
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};
