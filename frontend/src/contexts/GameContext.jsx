import React, { createContext, useState, useEffect } from "react";
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
  const [screen, setScreen] = useState("Landing"); // "Landing", "Join", "Settings", "GameBoard"
  const [gameId, setGameId] = useState("");
  const [playerInfo, setPlayerInfo] = useState({ name: "", id: "" });
  const [diceResult, setDiceResult] = useState(null);
  const [gameState, setGameState] = useState(null); // full snapshot from backend
  // Called by LandingScreen to create a new game
  const createGame = (playerName) => {
    const s = initSocket();
    setSocket(s);

    // Subscribe early so we catch the "player_joined" for ourselves
    subscribeToPlayerJoined(s, ({ player_id, player_name }) => {
      if (player_name === playerName) {
        setPlayerInfo({ name: player_name, id: player_id });
        setScreen("GameBoard");
      }
      // ignore other players joining
    });

    // Once we get "game_created", grab the new ID and immediately join as playerName
    subscribeToGameCreated(s, ({ game_id }) => {
      setGameId(game_id);
      emitJoinGame(s, game_id, playerName);
    });

    emitCreateGame(s);
  };

  // Called by JoinGameScreen to join an existing game
  const joinGame = (enteredGameId, playerName) => {
    const s = initSocket();
    setSocket(s);

    // Subscribe so we catch the "player_joined" for ourselves
    subscribeToPlayerJoined(s, ({ player_id, player_name }) => {
      if (player_name === playerName) {
        setPlayerInfo({ name: player_name, id: player_id });
        setScreen("GameBoard");
      }
      // ignore other players joining
    });

    emitJoinGame(s, enteredGameId, playerName);
    setGameId(enteredGameId);
    // playerInfo will be set when "player_joined" arrives
  };

  useEffect(() => {
    if (!socket) return;
    subscribeToDiceResult(socket, (data) => {
      setDiceResult(data.dice);
    });
    socket.on("state_update", (newState) => {
      setGameState(newState);
    });
  }, [socket]);

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
        gameState
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
