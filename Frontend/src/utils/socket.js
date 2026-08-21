import { io } from "socket.io-client";
import { API_ROOT_URL } from "./api";

const socket = io(API_ROOT_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["polling", "websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
