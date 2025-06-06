import React, { useState, useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export default function JoinGameScreen() {
  const { joinGame, setScreen } = useContext(GameContext);
  const [playerName, setPlayerName] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  useEffect(() => {
    // Save original styles
    const originalBgImage = document.body.style.backgroundImage;
    const originalBgColor = document.body.style.backgroundColor;

    // Override for landing screen
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#f0f0f0"; // or white

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundImage = originalBgImage;
      document.body.style.backgroundColor = originalBgColor;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h2 className="text-2xl mb-4">Join an Existing Game</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-64"
      />
      <input
        type="text"
        placeholder="Game ID"
        value={gameIdInput}
        onChange={(e) => setGameIdInput(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-64"
      />
      <button
        className="bg-green-600 text-white px-6 py-2 rounded w-64 mb-4"
        onClick={() => joinGame(gameIdInput, playerName)}
      >
        Join Game
      </button>
      <button
        className="text-gray-600 underline"
        onClick={() => setScreen("Landing")}
      >
        ← Back
      </button>
    </div>
  );
}
