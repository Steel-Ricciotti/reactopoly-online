import React, { createContext, useState, useEffect } from "react";
import {
  initSocket,
  createGame as emitCreateGame,
  joinGame as emitJoinGame,
  subscribeToGameCreated,
  subscribeToPlayerJoined,
  subscribeToDiceResult,
  // We'll add more subscribes in Iter 2
} from "../utils/socket.jsx";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState("Landing"); // "Landing", "Join", "Settings", "GameBoard"
  const [gameId, setGameId] = useState("");
  const [playerInfo, setPlayerInfo] = useState({ name: "", id: "" });
  const [players, setPlayers] = useState([]); // array of { player_id, player_name }
  const [diceResult, setDiceResult] = useState(null);

  // Called by LandingScreen to create a game
  const createGame = (playerName) => {
    const s = initSocket();
    setSocket(s);
    // Once the backend emits "game_created", we get the new gameId and immediately join
    subscribeToGameCreated(s, ({ game_id }) => {
      setGameId(game_id);
      emitJoinGame(s, game_id, playerName);
      setPlayerInfo((prev) => ({ ...prev, name: playerName }));
      setScreen("GameBoard");
    });
    emitCreateGame(s);
  };

  // Called by JoinGameScreen to join an existing game
  const joinGame = (enteredGameId, playerName) => {
    const s = initSocket();
    setSocket(s);
    subscribeToPlayerJoined(s, ({ player_id, player_name }) => {
      // If this event is for us, store our player_id
      // Note: for now, everyone in the room gets this event. We’ll refine filtering in Iter 2.
      setPlayerInfo({ name: player_name, id: player_id });
      setScreen("GameBoard");
    });
    emitJoinGame(s, enteredGameId, playerName);
    setGameId(enteredGameId);
    setPlayerInfo((prev) => ({ ...prev, name: playerName }));
  };

  useEffect(() => {
    if (!socket) return;
    subscribeToDiceResult(socket, (data) => {
      setDiceResult(data.dice);
    });
    // In Iter 2, subscribe to more events (property_bought, turn_changed, etc.)
  }, [socket]);

  const rollDice = () => {
    if (!socket || !gameId || !playerInfo.id) return;
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
        players,
        diceResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
