import { io } from "socket.io-client";

export function initSocket() {
  const baseURL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : undefined; // undefined means "same origin"
  
  const socket = io();  
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
  return socket;
}

export function createGame(socket, playerName) {
  socket.emit("create_game", { player_name: playerName });
}

export function joinGame(socket, gameId, playerName, piece = null) {
  socket.emit("join_game", { game_id: gameId, player_name: playerName, piece });
}

export function subscribeToGameCreated(socket, callback) {
  socket.on("game_created", (data) => {
    console.log("Received game_created:", data);
    callback(data);
  });
}

export function subscribeToPlayerJoined(socket, callback) {
  socket.on("player_joined", (data) => {
    console.log("Received player_joined:", data);
    callback(data);
  });
}

export function subscribeToDiceResult(socket, callback) {
  socket.on("dice_result", (data) => {
    console.log("Received dice_result:", data);
    callback(data);
  });
}
