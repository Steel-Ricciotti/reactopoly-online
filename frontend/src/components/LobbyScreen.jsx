import React, { useContext } from "react";
import { PIECES, getLabelById, GameContext } from "../contexts/GameContext";

export default function LobbyScreen() {
  const { gameState, playerInfo, startGame } = useContext(GameContext);

  if (!gameState) return <div>Loading Lobby...</div>;

  const { playerOrder = [], players = {} } = gameState;
  const isHost = playerOrder[0] === playerInfo.id;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Game Lobby</h2>
        <ul className="mb-6">
          {playerOrder.map((pid) => (
            <li key={pid} className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getLabelById(players[pid]?.piece) || "❓"}</span>
              <span>{players[pid]?.name || "?"}</span>
              {pid === playerOrder[0] && <span className="ml-2 text-green-500">(Host)</span>}
              {pid === playerInfo.id && <span className="ml-2 text-blue-500">(You)</span>}
            </li>
          ))}
        </ul>
        {isHost ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={startGame}
          >
            Start Game
          </button>
        ) : (
          <div className="text-gray-500">Waiting for host to start…</div>
        )}
      </div>
    </div>
  );
}
