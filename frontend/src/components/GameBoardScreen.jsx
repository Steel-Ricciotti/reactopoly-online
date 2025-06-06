import React, { useContext, useState, useEffect, useRef } from "react";
import { GameContext } from "../contexts/GameContext";
import DiceDisplay from "./DiceDisplay.jsx";
import GameInfoPanel from "./GameInfoPanel.jsx";
import centerLogo from "../assets/center-logo.png";
import { PROPERTY_DATA, GROUP_MAP } from "../utils/propertyData.js";
import PlayerPropertyCards from "./PlayerPropertyCards";
import "../styles.css";

export default function GameBoardScreen() {
  // ──────────── Hooks ────────────
  const {
    diceResult,
    rollDice,
    gameState,
    themeName,
    themes,
    socket, gameId, playerInfo,
    // buyProperty, // You don't need this for the modal, only for server-side confirmation now
  } = useContext(GameContext);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(true);
  // 🟢 Use only a single buy-modal state
  const [pendingBuy, setPendingBuy] = useState(null);
  const [rolling, setRolling] = useState(false);
  // 🟠 REMOVED: const [pendingBuyIndex, setPendingBuyIndex] = useState(null);
  const prevPositionRef = useRef(null);

  const handleUnmute = () => {
  if (audioRef.current) {
    audioRef.current.muted = false;
    audioRef.current.play().catch(() => {
      console.log("Failed to play after unmute");
    });
    setMuted(false);
  }
};

  // 🟢 Listen for can_buy_property event
  useEffect(() => {
    if (!socket) return;

    function onCanBuyProperty(data) {
      console.log("Can Buy")
      setPendingBuy({
        index: data.property_index,
        name: data.property_name,
        cost: data.property_cost,
      });
    }

    socket.on("can_buy_property", onCanBuyProperty);
    return () => socket.off("can_buy_property", onCanBuyProperty);
  }, [socket]);

  // 🟢 Call backend when user confirms
  const confirmBuy = () => {
    if (!pendingBuy) return;
    socket.emit("buy_property", {
      game_id: gameId,
      player_id: playerInfo.id,
    });
    setPendingBuy(null);
  };

  const passBuy = () => setPendingBuy(null);


  if (!gameState) {
    return (
      <p className="text-center mt-8 text-gray-700">Waiting for game state...</p>
    );
  }

  // ───────── Extract state ─────────
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
            backgroundColor: pid === playerInfo.id ? "#4caf50" : "#e91e63",
          }}
        >
          {players[pid].name[0].toUpperCase()}
        </span>
      ));

  const handleRoll = () => {
    if (rolling || !isMyTurn) return;
    setRolling(true);
    setTimeout(() => {
      rollDice();
      setRolling(false);
    }, 600);
  };

  // ─────────── Seat‐Card Rendering ───────────
  const renderPlayerCards = () => {
    const ownedByPlayer = {};
    for (const [idxStr, ownerId] of Object.entries(ownership)) {
      const idx = parseInt(idxStr, 10);
      if (!ownedByPlayer[ownerId]) ownedByPlayer[ownerId] = [];
      ownedByPlayer[ownerId].push(idx);
    }

    const seats = [
      {
        offsetStyle: {
          bottom: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          flexDirection: "row",
        },
      },
      {
        offsetStyle: {
          top: "50%",
          left: "-60px",
          transform: "translateY(-50%)",
          flexDirection: "column",
        },
      },
      {
        offsetStyle: {
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          flexDirection: "row",
        },
      },
      {
        offsetStyle: {
          top: "50%",
          right: "-60px",
          transform: "translateY(-50%)",
          flexDirection: "column",
        },
      },
    ];

    return playerOrder.slice(0, 4).map((pid, seatIndex) => {
      const cardIndices = ownedByPlayer[pid] || [];
      if (cardIndices.length === 0) return null;

      return (
        <div
          key={pid}
          className="absolute flex gap-1"
          style={seats[seatIndex].offsetStyle}
        >
          {cardIndices.map((idx) => {
            const { displayName } = theme[idx];
            const shortName = displayName.split(" ").slice(0, 2).join(" ");
            return (
              <div
                key={idx}
                className="w-[50px] h-[30px] bg-white border border-gray-700 rounded shadow-sm flex items-center justify-center text-[8px] text-gray-800"
                title={displayName}
              >
                {shortName}
              </div>
            );
          })}
        </div>
      );
    });
  };

  // ───────── Render ─────────
  return (
        <>
      {/* Audio element for background music */}
      <audio
        ref={audioRef}
        src="/music/chill_piano.mp3"
        loop
        playsInline
        muted
        autoPlay
      />

    <div className="relative mx-auto" style={{ width: "600px", height: "600px" }}>
      {/* Left‐side info panel */}
      <div className="absolute left-[-220px] top-0">
        <GameInfoPanel />
      </div>

      {/* Board container */}
      <div className="relative flex items-center justify-center">
        <div className="board">
            
          {Array.from({ length: 40 }, (_, idx) => {
            const [row, col] = indexToCoord(idx);
            const textColor = theme['titleTextColor']
            const themeInfo = theme['properties'][idx];
            const themeColor = themeInfo ? themeInfo.color : "#ffffff";
            const propInfo = PROPERTY_DATA[idx];
            const ownerId = ownership[idx];
            const baseColor = propInfo ? propInfo.color : "#ffffff";
            console.log(themeInfo)
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
                  textColor:textColor,
                  backgroundColor: themeColor,
                  width: "54px",
                  height: "54px",
                }}
                title={themeInfo ? themeInfo.displayName : `Space ${idx}`}
              >
                <div className="absolute top-0 left-0 text-[6px] p-1"
                   style={{ textColor: textColor }}
                   >
                  {themeInfo ? themeInfo.displayName : idx}
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
                {rolling ? "Rolling…" : isMyTurn ? "Roll Dice" : "Not Your Turn"}
              </button>
            </div>
          </div>
        </div>

        {/* Seat‐card rendering, closer to board */}
        <PlayerPropertyCards
          ownership={ownership}
          playerOrder={playerOrder}
          playerInfo={playerInfo}
          PROPERTY_DATA={PROPERTY_DATA}
        />
      </div>

      {/* 🟢 Buy‐property modal, backend-driven only */}
      {pendingBuy && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="mb-4">
              Buy{" "}
              <span className="font-semibold">
                {pendingBuy.name}
              </span>{" "}
              for $
              <span className="font-semibold">
                {pendingBuy.cost}
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
          {/* Unmute button */}
      {muted && (
        <button
          onClick={handleUnmute}
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50"
          aria-label="Unmute music"
        >
          🔈 Unmute Music
        </button>
      )}
    </>
  );
}
