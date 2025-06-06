// frontend/src/components/GameBoardScreen.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { GameContext } from "../contexts/GameContext";
import DiceDisplay from "./DiceDisplay.jsx";
import GameInfoPanel from "./GameInfoPanel.jsx";
import centerLogo from "../assets/center-logo.png";
import { PROPERTY_DATA, GROUP_MAP } from "../utils/propertyData.js";
import "../styles.css";

export default function GameBoardScreen() {
  // 1. Hooks at the top
  const {
    diceResult,
    rollDice,
    buyProperty,
    gameState,
    themeName,
    themes,
    playerInfo,
  } = useContext(GameContext);

  const [rolling, setRolling] = useState(false);
  const [pendingBuyIndex, setPendingBuyIndex] = useState(null);

  // Remember previous position to detect “land on unowned property”
  const prevPositionRef = useRef(null);

  // 2. Effect: watch for landing on a new, unowned property
  useEffect(() => {
    if (!gameState || !playerInfo.id) return;

    const myId = playerInfo.id;
    const prevPos = prevPositionRef.current;
    const myPos = gameState.players[myId]?.position;

    prevPositionRef.current = myPos;

    if (
      gameState.currentTurn === myId &&
      prevPos !== null &&
      prevPos !== myPos
    ) {
      const propInfo = PROPERTY_DATA[myPos];
      const ownership = gameState.properties || {};
      if (propInfo && !ownership[myPos]) {
        setPendingBuyIndex(myPos);
      }
    }
  }, [gameState, playerInfo.id]);

  // 3. Handlers for confirm/pass buy
  const confirmBuy = () => {
    if (pendingBuyIndex != null) {
      console.log("Buying property")
      buyProperty(pendingBuyIndex);
      setPendingBuyIndex(null);
    }
  };
  const passBuy = () => {
    setPendingBuyIndex(null);
  };

  // 4. Early-return if gameState not ready (hooks are already called)
  if (!gameState) {
    return (
      <p className="text-center mt-8 text-gray-700">
        Waiting for game state...
      </p>
    );
  }

  // 5. Extract data from gameState
  const {
    players,
    playerOrder,
    currentTurn,
    properties: propertiesMap = {},
  } = gameState;
  const ownership = propertiesMap || {};
  const theme = themes[themeName];
  const myId = playerInfo.id;
  const isMyTurn = currentTurn === myId;

  // 6. Helpers for board mapping and tokens
  const indexToCoord = (idx) => {
    if (idx >= 0 && idx <= 10) return [0, 10 - idx];
    if (idx >= 11 && idx <= 20) return [idx - 10, 0];
    if (idx >= 21 && idx <= 30) return [10, idx - 20];
    return [40 - idx, 10];
  };
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

  // 7. Roll dice button handler
  const handleRoll = () => {
    if (rolling || !isMyTurn) return;
    setRolling(true);
    setTimeout(() => {
      rollDice();
      setRolling(false);
    }, 600);
  };

  // 8. Render tiny stacked cards inside owned squares (unchanged)
  const renderPropertyCards = (idx) => {
    const propInfo = PROPERTY_DATA[idx];
    if (!propInfo) return null;

    const group = propInfo.group;
    const allInGroup = GROUP_MAP[group] || [];
    const ownedCount = allInGroup.filter(
      (i) => ownership[i] === playerInfo.id
    ).length;
    console.log(ownedCount);
    if (ownedCount === 0) return null;
    if (ownership[idx] !== playerInfo.id) return null;

    return Array.from({ length: ownedCount }, (_, stackIndex) => (
      <div
        key={stackIndex}
        className="absolute top-1 left-1 border-2 border-gray-800 bg-white"
        style={{
          width: "20px",
          height: "14px",
          transform: `translate(${stackIndex * 2}px, ${stackIndex * 2}px)`,
          zIndex: 10 + stackIndex,
        }}
      />
    ));
  };

  // 9. Build a map: playerId → array of property indices they own
  const ownedByPlayer = {};
  for (const [idxStr, ownerId] of Object.entries(ownership)) {
    const idx = parseInt(idxStr, 10);
    if (!ownedByPlayer[ownerId]) ownedByPlayer[ownerId] = [];
    ownedByPlayer[ownerId].push(idx);
  }

  // 10. Render “cards in front of players”:
  //   - bottom (playerOrder[0]): flex‐row under board
  //   - left (playerOrder[1]): flex‐col to the left of board
  //   - top (playerOrder[2]): flex‐row above board
  //   - right (playerOrder[3]): flex‐col to the right of board
  const renderPlayerCards = () => {
    const seats = [
      { anchor: "bottom", offsetStyle: { bottom: "-800px", left: "50%", transform: "translateX(-50%)", flexDirection: "row" } },
      { anchor: "left", offsetStyle: { top: "50%", left: "-80px", transform: "translateY(-50%)", flexDirection: "column" } },
      { anchor: "top", offsetStyle: { top: "-80px", left: "50%", transform: "translateX(-50%)", flexDirection: "row" } },
      { anchor: "right", offsetStyle: { top: "50%", right: "-80px", transform: "translateY(-50%)", flexDirection: "column" } },
    ];
    console.log("Render Cards.")
    return playerOrder.slice(0, 4).map((pid, seatIndex) => {
      const cardIndices = ownedByPlayer[pid] || [];
      if (cardIndices.length === 0) return null;

      const style = {
        position: "absolute",
        display: "flex",
        gap: "8px",
        ...seats[seatIndex].offsetStyle,
      };

      return (
        <div key={pid} style={style}>
          {cardIndices.map((idx) => {
            const { displayName } = PROPERTY_DATA[idx];
            return (
              <div
                key={idx}
                // className="border bg-white p-1 text-[10px] text-center shadow"
                // style={{ width: "60px", height: "40px" }}
                
              >
                
                {displayName.split(" ").slice(0, 2).join(" ")}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="relative mx-auto" style={{ width: "600px", height: "600px" }}>
      {/* Floating Info Panel */}
      <div className="absolute left-[-220px] top-0">
        <GameInfoPanel />
      </div>

      {/* Board Container */}
      <div className="relative flex items-center justify-center">
        {/* 11×11 Grid (600×600px board) */}
        <div className="board">
          {Array.from({ length: 40 }, (_, idx) => {
            const [row, col] = indexToCoord(idx);
            const propInfo = PROPERTY_DATA[idx];
            const ownerId = ownership[idx];
            const baseColor = propInfo ? propInfo.color : "#ffffff";
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
                title={propInfo ? propInfo.displayName : `Space ${idx}`}
              >
                <div className="absolute top-0 left-0 text-[6px] p-1 text-gray-800">
                  {propInfo ? propInfo.displayName : idx}
                </div>
                {tokensAt(idx)}
                {overlay}
                {renderPropertyCards(idx)}
              </div>
            );
          })}

          {/* Center area (rows 2–10, cols 2–10) */}
          <div className="center">
            <img
              src={centerLogo}
              alt="Center Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
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

        {/* 10. Player‐seat property cards */}
        {renderPlayerCards()}
      </div>

      {/* Buy-Property Modal */}
      {pendingBuyIndex != null && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="mb-4">
              Buy{" "}
              <span className="font-semibold">
                {PROPERTY_DATA[pendingBuyIndex].displayName}
              </span>{" "}
              for $
              <span className="font-semibold">
                {PROPERTY_DATA[pendingBuyIndex].cost}
              </span>
              ?
            </p>
            <div className="flex justify-around">
              <button className="modal-button" onClick={confirmBuy}>
                Buy
              </button>
              <button className="modal-button" onClick={passBuy}>
                Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
