import prisma from '../config/db.config.js';
import { RideStatus } from '../generated/prisma/index.js';
export const createRide = async (req, res) => {
  try {
    const {
      userId,
      startLocation,
      endLocation,
      route,
      departureTime,
      availableSeats,
      model,
      licenseNo,
      color,
      capacity,
      price,
    } = req.body;

    console.log("Create Ride Body:", req.body);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found.' });
    }

    const departureDate = new Date(departureTime);
    if (isNaN(departureDate.getTime())) {
      return res.status(400).json({ message: 'Invalid departure time.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log(user);
    if (!user || user.role !== 'DRIVER') {
      return res.status(403).json({ message: 'User is not authorized to create a ride.' });
    }

    // Ensure vehicle is created or updated for the driver
    const existingVehicle = await prisma.vehicle.findUnique({ where: { userId } });

    let vehicle;
    if (existingVehicle) {
      vehicle = await prisma.vehicle.update({
        where: { userId },
        data: {
          model,
          licenseNo,
          color,
          capacity,
        },
      });
    } else {
      vehicle = await prisma.vehicle.create({
        data: {
          userId,
          model,
          licenseNo,
          color,
          capacity,
        },
      });
    }

    // Create the ride
    const ride = await prisma.rideGiven.create({
      data: {
        driverId: userId,
        startLocation,
        endLocation,
        route,
        departureTime: departureDate,
        availableSeats,
        price,
        status: RideStatus.PENDING
      },
    });

    res.status(201).json({
      message: 'Ride and vehicle created successfully.',
      ride,
      vehicle,
    });

  } catch (error) {
    console.error('Create Ride Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllRides = async (req, res) => {
  try {
    const { destination } = req.params; // Or req.query if using GET
    console.log("Destination filter:", destination);

    const rides = await prisma.rideGiven.findMany({
      where: {
        status: RideStatus.PENDING,
        ...(destination && {
          OR: [
            {
              endLocation: {
                contains: destination,
                mode: 'insensitive',
              },
            },
            {
              route: {
                contains: destination,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
      include: {
        driver: {
          select: { id: true, name: true, email: true },
        },
        bookings: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    res.json(rides);
  } catch (err) {
    console.error('Error fetching rides:', err);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
};



