import React, { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export default function GameBoardScreen() {
  const { gameId, playerInfo, diceResult, rollDice } = useContext(GameContext);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h2 className="text-xl mb-2">Game ID: {gameId}</h2>
      <p className="mb-4">You are: {playerInfo.name} (ID: {playerInfo.id})</p>
      <div className="mb-4">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={rollDice}
        >
          Roll Dice
        </button>
      </div>
      {diceResult && (
        <p className="mb-4">
          You rolled: {diceResult[0]} and {diceResult[1]}
        </p>
      )}
      <p className="text-gray-600">[Game board UI will go here in Iter 2]</p>
    </div>
  );
}
