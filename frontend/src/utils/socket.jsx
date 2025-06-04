import { io } from "socket.io-client";

export function initSocket() {
  const socket = io("http://localhost:8000"); // Ensure your backend is on port 8000
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
  return socket;
}

export function createGame(socket) {
  socket.emit("create_game", {});
}

export function joinGame(socket, gameId, playerName) {
  socket.emit("join_game", { game_id: gameId, player_name: playerName });
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

// In Iter 2, we’ll add: subscribeToPropertyBought, subscribeToTurnChanged, etc.
