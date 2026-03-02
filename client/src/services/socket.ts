import { io, Socket } from 'socket.io-client';

// In production: VITE_API_URL = "https://sentinal-api.onrender.com/api"
// → socket connects to  "https://sentinal-api.onrender.com"
// In development: falls back to localhost:5000
const SERVER_ORIGIN =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SERVER_ORIGIN, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

export const joinFlatRoom = (flatNumber: string) => {
  const s = getSocket();
  if (flatNumber) {
    s.emit('joinFlatRoom', flatNumber);
  }
};


