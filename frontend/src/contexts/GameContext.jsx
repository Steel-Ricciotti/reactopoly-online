// frontend/src/contexts/GameContext.jsx
import React, { createContext, useState } from "react";
import {
  initSocket,
  createGame as emitCreateGame,
  joinGame as emitJoinGame,
  subscribeToGameCreated,
  subscribeToPlayerJoined,
  subscribeToDiceResult,
} from "../utils/socket.jsx";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState("Landing");
  const [gameId, setGameId] = useState("");
  const [playerInfo, setPlayerInfo] = useState({ name: "", id: "" });
  const [diceResult, setDiceResult] = useState(null);
  const [gameState, setGameState] = useState(null);

  const setupSocketListeners = (s, localName) => {
    s.on("state_update", (newState) => {
      setGameState(newState);
    });
    subscribeToDiceResult(s, (data) => {
      setDiceResult(data.dice);
    });
    subscribeToPlayerJoined(s, ({ player_id, player_name }) => {
      if (player_name === localName) {
        setPlayerInfo({ name: player_name, id: player_id });
        setScreen("GameBoard");
      }
    });
  };

  const createGame = (playerName) => {
    const s = initSocket();
    setupSocketListeners(s, playerName);
    setSocket(s);

    subscribeToGameCreated(s, ({ game_id }) => {
      setGameId(game_id);
      emitJoinGame(s, game_id, playerName);
    });

    emitCreateGame(s);
  };

  const joinGame = (enteredGameId, playerName) => {
    const s = initSocket();
    setupSocketListeners(s, playerName);
    setSocket(s);

    emitJoinGame(s, enteredGameId, playerName);
    setGameId(enteredGameId);
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
        rollDice,
        gameId,
        playerInfo,
        diceResult,
        gameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
