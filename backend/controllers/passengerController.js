import prisma from "../config/db.config.js";

export const getPendingRequests = async (req, res) => {
    try {
      // Get passenger ID from authenticated user
      const {user} = req.body;
      const passengerId = user.id;
      console.log(passengerId);
      // Find pending bookings for this specific passenger
      const pendingRides = await prisma.booking.findMany({
        where: {
          passengerId,
          status: "PENDING"
        },
        include: {
          ride: true, 
          passenger: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
  
      // Check if any rides were found
      if (pendingRides.length === 0) {
        return res.status(200).json({
          message: "No pending rides found",
          pendingRides: []
        });
      }
  
      res.status(200).json({
        message: "Pending requests retrieved successfully",
        pendingRides
      });
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({
        message: "Failed to fetch pending requests",
        error: error.message,
      });
    }
  };
  
export const getApprovedRides = async (req, res) => {
  try {
    // Get passenger ID from authenticated user
    const {user} = req.body;
    const passengerId = user.id;
    // Find approved bookings for this specific passenger
    const approvedRides = await prisma.booking.findMany({
      where: {
        passengerId,
        status: "ACCEPTED"
      },
      include: {
        ride: true,
        passenger: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Check if any rides were found
    if (approvedRides.length === 0) {
      return res.status(200).json({
        message: "No approved rides found",
        rides: []
      });
    }

    // Transform the data to match the expected format in the frontend
    const formattedRides = approvedRides.map(booking => {
      return {
        id: booking.ride.id,
        startLocation: booking.ride.startLocation,
        endLocation: booking.ride.endLocation,
        departureTime: booking.ride.departureTime,
        price: booking.fare,
        bookingId: booking.id,
        status: booking.status,
        availableSeats: booking.ride.availableSeats,
        carModel: booking.ride.carModel,
        carColor: booking.ride.carColor
      };
    });

    res.status(200).json({
      message: "Approved rides retrieved successfully",
      approvedRides : formattedRides
    });
  } catch (error) {
    console.error("Error fetching approved rides:", error);
    res.status(500).json({
      message: "Failed to fetch approved rides",
      error: error.message,
    });
  }
}