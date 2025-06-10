// frontend/src/components/GameInfoPanel.jsx
import React, { useContext } from "react";
import { PIECES, getLabelById, GameContext } from "../contexts/GameContext";
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
    style={{ width: "220px" }}
  >
    <h3 className="text-lg font-semibold mb-2">Game Info</h3>
    <div className="mb-2">
      <span className="font-medium">Game ID:</span>
      <div className="text-gray-800 break-all">{gameId}</div>
    </div>
    <div className="mb-4">
      <span className="font-medium">Players:</span>
      <div className="flex flex-col gap-1 mt-2">
        {Object.entries(players).map(([pid, info]) => (
          <div
            key={pid}
            className={`flex items-center justify-between px-2 py-1 rounded 
              ${pid === currentTurn ? "bg-blue-100 font-bold" : ""}
              ${pid === playerInfo.id ? "border border-green-400" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLabelById(info.piece) || "🚗"}</span>
              <span>
                {/* {info.name} */}
                {pid === playerInfo.id && <span className="ml-1 text-xs text-green-600">(You)</span>}
                {pid === currentTurn && <span className="ml-1 text-xs text-blue-600">(Turn)</span>}
              </span>
            </div>
            <span className="text-gray-700 font-mono text-sm">
              ${info.money}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

}
