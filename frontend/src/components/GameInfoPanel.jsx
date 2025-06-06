// frontend/src/components/GameInfoPanel.jsx
import React, { useContext } from "react";
import { GameContext } from "../contexts/GameContext";
import "../styles.css";

export default function GameInfoPanel() {
  const { gameId, playerInfo, gameState } = useContext(GameContext);

  // If gameState isn’t ready yet, show a placeholder
  if (!gameState) {
    return (
      <div
        className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 mr-4"
        style={{ width: "200px" }}
      >
        <h3 className="text-lg font-semibold mb-2">Game Info</h3>
        <div className="text-gray-600 italic">Loading…</div>
      </div>
    );
  }

  const { players, currentTurn } = gameState;
  const currentTurnName = players[currentTurn]?.name || "—";

  return (
    <div
      className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 mr-4"
      style={{ width: "200px" }}
    >
      <h3 className="text-lg font-semibold mb-2">Game Info</h3>
      <div className="mb-2">
        <span className="font-medium">Game ID:</span>
        <div className="text-gray-800 break-all">{gameId}</div>
      </div>
      <div className="mb-2">
        <span className="font-medium">You:</span>
        <div className="text-gray-800">{playerInfo.name}</div>
      </div>
      <div className="mb-2">
        <span className="font-medium">Current Turn:</span>
        <div className="text-gray-800">{currentTurnName}</div>
      </div>
    </div>
  );
}
