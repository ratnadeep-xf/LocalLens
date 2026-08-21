import { io } from "socket.io-client";
import { API_ROOT_URL } from "./api";

// Vercel serverless cannot keep a Socket.IO server alive, so skip connecting
// there. Local / long-running hosts still get realtime updates.
const canUseRealtime = !/vercel\.app$/i.test(
  new URL(API_ROOT_URL, "http://localhost").hostname
);

const socket = io(API_ROOT_URL, {
  autoConnect: canUseRealtime,
  reconnection: canUseRealtime,
  withCredentials: true,
  transports: ["polling", "websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
