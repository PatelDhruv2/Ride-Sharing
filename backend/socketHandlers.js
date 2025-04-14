const handleSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle joining a booking room
    socket.on('joinBooking', (bookingId) => {
      socket.join(bookingId);
      console.log(`User ${socket.id} joined booking: ${bookingId}`);
    });

    // Handle location updates
    socket.on('locationUpdate', ({ bookingId, role, location }) => {
      // Broadcast location to everyone in the booking room except sender
      socket.to(bookingId).emit('locationUpdate', { role, location });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default handleSocketEvents;
