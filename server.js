const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const formatMessage = require('./utils/message');
const { userJoin, getCurrentUser } = require('./utils/users');
const app = express();

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit('message', formatMessage('Admin', 'Welcome to the chatYard'));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage('Admin', `${username} has joined the chatYard`)
      );
  });

  socket.on('disconnect', (message) => {
    io.emit('message', formatMessage('Admin', `user has left the chatYard`));
  });

  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, message));
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
