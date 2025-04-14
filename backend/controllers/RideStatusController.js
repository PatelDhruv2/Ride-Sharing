import prisma from '../config/db.config.js';

export const startRide = async (req, res) => {
  const { bookingId } = req.params;
  
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'IN_PROGRESS' },
      include: {
        ride: true,
        passenger: true
      }
    });

    // Create a notification for the passenger
   

    res.json(booking);
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ error: 'Failed to start ride' });
  }
};

export const endRide = async (req, res) => {
  const { bookingId } = req.params;
  
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
      include: {
        ride: true,
        passenger: true
      }
    });

   

    res.json(booking);
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ error: 'Failed to end ride' });
  }
};
