import prisma from "../config/db.config.js";

export const getDriverBookings = async (req, res) => {
  try {

    const {user} = req.body;
    const driverId = user.id;
    console.log(driverId);
    // Get all rides given by the driver
    const rides = await prisma.rideGiven.findMany({
      where: {
        driverId,
        status: "PENDING"
      },
      include: {
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            baggage: true,
          },
        },
      },
    });

    // Transform the data to include all necessary information
    const bookingsWithDetails = rides.flatMap(ride => 
      ride.bookings.map(booking => ({
        rideId: ride.id,
        startLocation: ride.startLocation,
        endLocation: ride.endLocation,
        departureTime: ride.departureTime,
        bookingId: booking.id,
        passenger: booking.passenger,
        fare: booking.fare,
        status: booking.status,
        time: booking.Time,
        location: booking.Location,
        baggage: booking.baggage ? {
          numberOfBags: booking.baggage.numberOfBags,
          totalWeight: booking.baggage.totalWeight,
        } : null,
      }))
    );

    res.json({
      success: true,
      data: bookingsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver bookings',
    });
  }
}; 


export const approveRideRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    const { status } = req.body;
    const bookingId = id;
    console.log(bookingId);
    console.log(status);

    // Validate input
    if (!bookingId || !status) {
      return res.status(400).json({ message: "bookingId and status are required" });
    }

    // Check if the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    const updatedRideGiven = await prisma.rideGiven.update({
      where : {
        id : updatedBooking.rideId
      },
      data : {status}
    })
    
    return res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getDriverApprovedRides = async (req, res) => {
  try {
    // Get driver ID from authenticated user
    const {user} = req.body;
    const driverId = user.id;
    console.log(driverId);
    // Get all rides given by the driver that have been accepted
    const rides = await prisma.rideGiven.findMany({
      where: {
        driverId,
        status: "ACCEPTED"
      },
      include: {
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            baggage: true,
          },
        },
      },
    });
    console.log(rides);
    // Transform the data to include all necessary information
    const approvedRides = rides.flatMap(ride => 
      ride.bookings.map(booking => ({
        id: ride.id,
        startLocation: ride.startLocation,
        endLocation: ride.endLocation,
        departureTime: ride.departureTime,
        bookingId: booking.id,
        passenger: booking.passenger,
        price: booking.fare,
        status: booking.status,
        availableSeats: ride.availableSeats,
        carModel: ride.carModel,
        carColor: ride.carColor,
        distance: ride.distance
      }))
    );
    console.log(approvedRides);
    res.status(200).json({
      success: true,
      message: "Approved rides retrieved successfully",
      approvedRides
    });
  } catch (error) {
    console.error('Error fetching driver approved rides:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver approved rides',
    });
  }
};