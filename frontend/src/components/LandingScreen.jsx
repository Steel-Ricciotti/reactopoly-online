import React, { useState, useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export default function LandingScreen() {
  const { createGame, joinGame, setScreen } = useContext(GameContext);
  const [playerName, setPlayerName] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Monopoly Online</h1>
      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-64"
      />
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded w-64 mb-4"
        onClick={() => createGame(playerName)}
      >
        New Game
      </button>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Game ID"
          value={gameIdInput}
          onChange={(e) => setGameIdInput(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-48 mr-2"
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => joinGame(gameIdInput, playerName)}
        >
          Join Game
        </button>
      </div>
      <button
        className="text-gray-600 underline"
        onClick={() => setScreen("Settings")}
      >
        Settings
      </button>
    </div>
  );
}
