// frontend/src/components/GameBoardScreen.jsx
import React, { useContext, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import DiceDisplay from "./DiceDisplay.jsx";
import GameInfoPanel from "./GameInfoPanel.jsx";
import coffeeTableImg from "../assets/coffee-table.png";
import centerLogo from "../assets/center-logo.png";
import "../styles.css";

export default function GameBoardScreen() {
  const {
    diceResult,
    rollDice,
    gameState,
    themeName,
    themes,
    playerInfo,
  } = useContext(GameContext);

  const [rolling, setRolling] = useState(false);

  if (!gameState) {
    return (
      <p className="text-center mt-8 text-gray-700">
        Waiting for game state...
      </p>
    );
  }

  const { players, playerOrder, currentTurn } = gameState;
  const ownership = gameState.properties || {};
  const theme = themes[themeName];

  // Convert 0–39 to (row, col) in an 11×11 grid
  const indexToCoord = (idx) => {
    if (idx >= 0 && idx <= 10) {
      return [0, 10 - idx];
    } else if (idx >= 11 && idx <= 20) {
      return [idx - 10, 0];
    } else if (idx >= 21 && idx <= 30) {
      return [10, idx - 20];
    } else {
      return [40 - idx, 10];
    }
  };

  // Show tokens on a given position
  const tokensAt = (pos) =>
    playerOrder
      .filter((pid) => players[pid].position === pos)
      .map((pid) => (
        <span
          key={pid}
          className="piece"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor:
              pid === playerInfo.id ? "#4caf50" : "#e91e63",
          }}
        >
          {players[pid].name[0].toUpperCase()}
        </span>
      ));

  const isMyTurn = currentTurn === playerInfo.id;

  // Handle rolling animation then emit rollDice()
  const handleRoll = () => {
    if (rolling || !isMyTurn) return;
    setRolling(true);
    setTimeout(() => {
      rollDice();
      setRolling(false);
    }, 600);
  };

  return (
    // <div className="flex items-start justify-center min-h-screen bg-gray-200 py-4">
    <div className="relative mx-auto">
    
      {/* Left‐side info panel */}
      <div className="absolute left-[-400px] top-0">
      <GameInfoPanel />
</div>
      {/* Board container */}
      <div className="relative flex items-center justify-center">
        {/* Coffee‐table background frame (896×896px) */}
        {/* <div
          className="absolute inset-0 mx-auto my-auto bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${coffeeTableImg})`,
            width: "896px",
            height: "896px",
          }}
        /> */}

        {/* 11×11 Grid (600×600px board) */}
        <div className="board">
          {Array.from({ length: 40 }, (_, idx) => {
            const [row, col] = indexToCoord(idx);
            const propData = theme.properties[idx];
            const ownerId = ownership[idx];
            const baseColor = propData ? propData.color : "#ffffff";
            const overlay = ownerId ? (
              <div className="absolute inset-0 bg-black opacity-20 rounded" />
            ) : null;

            return (
              <div
                key={idx}
                data-testid={`space-${idx}`}
                className={`property ${
                  idx <= 10
                    ? "top-row"
                    : idx >= 30 && idx <= 39
                    ? "right-column"
                    : idx >= 20 && idx <= 30
                    ? "bottom-row"
                    : idx >= 10 && idx <= 20
                    ? "left-column"
                    : ""
                }`}
                style={{
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  backgroundColor: baseColor,
                  width: "54px",
                  height: "54px",
                }}
                title={propData ? propData.displayName : `Space ${idx}`}
              >
                <div className="absolute top-0 left-0 text-[6px] p-1 text-gray-800">
                  {propData ? propData.displayName : idx}
                </div>
                {tokensAt(idx)}
                {overlay}
              </div>
            );
          })}

          {/* Center area (rows 2–10, cols 2–10) */}
          <div className="center">
            <img
              src={centerLogo}
              alt="Center Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            {/* Dice + Roll button */}
            <div className="dice-container">
              <div className="dice-row">
                <DiceDisplay diceResult={diceResult} rolling={rolling} />
              </div>
              <button
                className="roll-button"
                onClick={handleRoll}
                disabled={!isMyTurn || rolling}
              >
                {rolling
                  ? "Rolling…"
                  : isMyTurn
                  ? "Roll Dice"
                  : "Not Your Turn"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
