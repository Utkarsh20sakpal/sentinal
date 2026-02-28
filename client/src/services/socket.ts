import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
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


