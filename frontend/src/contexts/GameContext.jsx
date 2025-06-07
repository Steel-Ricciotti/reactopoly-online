import React, {useEffect, createContext, useState } from "react";
import {
  initSocket,
  createGame as emitCreateGame,
  joinGame as emitJoinGame,
  subscribeToGameCreated,
  subscribeToPlayerJoined,
  subscribeToDiceResult,
} from "../utils/socket.jsx";
import { THEMES } from "../utils/themes.js";
import { MUSIC } from "../utils/music.js";

export const PIECES = [
  { id: "car", label: "🚗" },
  { id: "hat", label: "🎩" },
  { id: "dog", label: "🐕" },
  { id: "ship", label: "🚢" },
  { id: "wheelbarrow", label: "🛒" },
];


export const GameContext = createContext();

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState("Landing");
  const [gameId, setGameId] = useState("");
  const [playerInfo, setPlayerInfo] = useState({ name: "", id: "" });
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [themeName, setThemeName] = useState("classic"); // default
  const [musicName, setMusic] = useState("default"); // default
  const setupSocketListeners = (s, localName) => {
    s.on("state_update", (newState) => {
      setGameState(newState);
    });
    s.on("game_started", (state) => {
      setGameState(state);
      setScreen("GameBoard");
    });    
    subscribeToDiceResult(s, (data) => {
      setDiceResult(data.dice);
    });
  subscribeToPlayerJoined(s, ({ player_id, player_name, piece }) => {
    if (player_name === localName) {
      setPlayerInfo({ id: player_id, name: player_name });
      if (piece) {
        setSelectedPiece(piece);
        setScreen("Lobby"); // Go to lobby after joining with a piece
      } else {
        setScreen("PieceSelection"); // Go to piece selection if not picked yet
      }
    }
  });
  };

  const startGame = () => {
  if (socket && gameId) {
    socket.emit("start_game", { game_id: gameId });
  }
};
  // --- Start a new game (go to piece selection when ready) ---
  const createGame = (playerName) => {
    const s = initSocket();
    setupSocketListeners(s, playerName);
    setSocket(s);

    subscribeToGameCreated(s, ({ game_id }) => {
      setGameId(game_id);
      // emitJoinGame(s, game_id, playerName);
    });

    emitCreateGame(s);
    setSelectedPiece(null);
    setPlayerInfo({ id: "", name: playerName });
    setScreen("PieceSelection");
  };
  // Initialize socket on first mount and keep alive for all screens
  useEffect(() => {
    const s = initSocket();
    setSocket(s);

    return () => {
      if (s) s.disconnect();
    };
  }, []);
  // --- Join existing game (to be used with a code) ---
  const joinGame = (enteredGameId, playerName) => {
    const s = initSocket();
    setupSocketListeners(s, playerName);
    setSocket(s);

    // emitJoinGame(s, enteredGameId, playerName);
    setGameId(enteredGameId);
    setSelectedPiece(null);
    setPlayerInfo({ id: "", name: playerName });
    setScreen("PieceSelection");
  };

  // --- Choose piece (called from PieceSelectionScreen) ---
  const choosePiece = (pieceId) => {
    if (!gameId || !playerInfo.name || !socket) return;
    setSelectedPiece(pieceId);
    emitJoinGame(socket, gameId, playerInfo.name, pieceId);
    setScreen("Lobby");
  };

  const buyProperty = (propertyIndex) => {
    if (!socket || !gameId || !playerInfo.id) return;
    socket.emit("buy_property", {
      game_id: gameId,
      player_id: playerInfo.id,
      property_index: propertyIndex,
    });
  };

  const rollDice = () => {
    if (!socket || !gameId || !playerInfo.id) return;
    if (gameState && gameState.currentTurn !== playerInfo.id) return;
    socket.emit("roll_dice", { game_id: gameId, player_id: playerInfo.id });
  };

  return (
    <GameContext.Provider
      value={{
        screen,
        setScreen,
        createGame,
        joinGame,
        choosePiece,
        buyProperty,
        rollDice,
        gameId,
        playerInfo,
        selectedPiece,
        setSelectedPiece,
        diceResult,
        gameState,
        socket,
        themeName,
        setThemeName,
        setMusic,
        themes: THEMES,
        music: MUSIC,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
