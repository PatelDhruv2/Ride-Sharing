import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

const rideChats = new Map(); // Temporary storage for ride-specific chats

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      // Join a ride chat room
      const { rideId, userId } = data;
      ws.rideId = rideId;
      ws.userId = userId;

      if (!rideChats.has(rideId)) {
        rideChats.set(rideId, []);
      }

      ws.send(JSON.stringify({ type: 'history', messages: rideChats.get(rideId) }));
    } else if (data.type === 'message') {
      // Broadcast message to all users in the same ride
      const { rideId, userId, text } = data;
      const chatMessage = { userId, text, timestamp: new Date() };

      if (rideChats.has(rideId)) {
        rideChats.get(rideId).push(chatMessage);
      }

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.rideId === rideId) {
          client.send(JSON.stringify({ type: 'message', message: chatMessage }));
        }
      });
    }
  });

  ws.on('close', () => {
    // Handle cleanup if needed
  });
});

console.log('WebSocket server running on ws://localhost:8080');