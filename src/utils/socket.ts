import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string, userId: number) => {
  // Si ya está conectado, solo autenticar
  if (socket?.connected) {
    socket.emit("authUser", { id_usuario: userId });
    return socket;
  }

  // Si existe pero no está conectado, desconectar primero
  if (socket) {
    socket.disconnect();
  }

  socket = io("https://smartservicebackend-production.up.railway.app", {
       //socket = io("http://localhost:4000", {
    auth: { 
      token: token 
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Conectado a Socket.IO");
    // Autenticar usuario
    socket?.emit("authUser", { id_usuario: userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ Desconectado de Socket.IO");
  });

  socket.on("error", (error) => {
    console.error("❌ Error en Socket.IO:", error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

