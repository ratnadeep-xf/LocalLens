import { io } from "socket.io-client";
import { API_ROOT_URL } from "./api";

const socket = io(API_ROOT_URL, { autoConnect: true });

export default socket;
