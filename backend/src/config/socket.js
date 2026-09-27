import { Server } from "socket.io";

// Holds the single Socket.IO server instance after it's created in
// server.js, so any other file (services, controllers) can grab it via
// getIO() without passing `io` down through every function call.
let ioInstance = null;

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.CLIENT_URL ||
        "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance = io;

  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error(
      "Socket.IO has not been initialized yet. Call initializeSocket() in server.js before using getIO()."
    );
  }
  return ioInstance;
};

export default initializeSocket;
export { getIO };
