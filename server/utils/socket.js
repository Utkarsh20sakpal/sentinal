let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('joinFlatRoom', (flatNumber) => {
      if (flatNumber) {
        socket.join(`flat-${flatNumber}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });
};

const getIO = () => ioInstance;

// Middleware to attach io to every request (for controllers to emit events)
const attachIOToRequest = (io) => (req, res, next) => {
  req.io = io;
  next();
};

module.exports = {
  initSocket,
  getIO,
  attachIOToRequest,
};


