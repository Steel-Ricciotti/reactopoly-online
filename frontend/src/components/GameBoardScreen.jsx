import React, { useContext, useState, useEffect, useRef } from "react";
import { GameContext, PIECES } from "../contexts/GameContext";
import DiceDisplay from "./DiceDisplay.jsx";
import GameInfoPanel from "./GameInfoPanel.jsx";
import centerLogo from "../assets/center-logo.png";
import { PROPERTY_DATA, GROUP_MAP } from "../utils/propertyData.js";
import PlayerPropertyCards from "./PlayerPropertyCards";
import BuyHouseModal from "./BuyHouseModal"; // You need to implement this
import "../styles.css";

export default function GameBoardScreen() {
  // ──────────── Hooks ────────────
  const {
    diceResult,
    rollDice,
    gameState,
    themeName,
    themes,
    socket,
    gameId,
    playerInfo,
    buyHouse, // new context function
  } = useContext(GameContext);

  const audioRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [pendingBuy, setPendingBuy] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [showBuyHouseModal, setShowBuyHouseModal] = useState(false);
  const [drawnCard,setDrawnCard] = useState(null)
  const [taxCard, setTaxCard] = useState(null)
  // Helper to get eligible groups for buying houses
function getEligibleGroups(gameState, myId) {
  if (!gameState) return [];
  
  const excluded = ["rail", "utility"];
  // Find all color groups (as strings)
  const colorGroups = Array.from(
    new Set(
      Object.values(PROPERTY_DATA)
        .map(p => p.group)
        .filter(g => !excluded.includes(g))
    )
  );
 
  // For each group, log out who owns what
  colorGroups.forEach(groupName => {
    const propsInGroup = Object.entries(PROPERTY_DATA)
      .filter(([idx, data]) => data.group === groupName)
      .map(([idx, data]) => {
        // Get the owner if it exists in gameState
        const propIdx = parseInt(idx, 10);
        const propOwner = gameState.properties[propIdx]?.owner || null;
        return { idx: propIdx, owner: propOwner, name: data.displayName };
      });
    propsInGroup.forEach(({ idx, owner, name }) => {
    });
  });

  // Now filter for groups the player owns entirely
  const eligible = colorGroups.filter((groupName) => {
    const propsInGroup = Object.entries(PROPERTY_DATA)
      .filter(([idx, data]) => data.group === groupName)
      .map(([idx]) => parseInt(idx, 10));
    const ownsAll = propsInGroup.length > 0 && propsInGroup.every(
      (idx) => {
        const prop = gameState.properties[idx];
        return prop && prop.owner === myId;
      }
    );
    return ownsAll;
  });

  return eligible;
}


  const eligibleGroups = getEligibleGroups(gameState, playerInfo.id);

  const handleUnmute = () => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {
        console.log("Failed to play after unmute");
      });
      setMuted(false);
    }
  };

useEffect(() => {
  if (!socket) return;
  function onDrawCard({ type, card }) {
    setDrawnCard({ type, ...card });
  }
  socket.on("draw_card", onDrawCard);
  return () => socket.off("draw_card", onDrawCard);
}, [socket]);


useEffect(() => {
  if (!socket) return;
  function onTaxCard() {
    setTaxCard(true);
  }
  socket.on("draw_tax", onTaxCard);
  return () => socket.off("draw_tax", onTaxCard);
}, [socket]);





  useEffect(() => {
    if (!socket) return;
    function onCanBuyProperty(data) {
      setPendingBuy({
        index: data.property_index,
        name: data.property_name,
        cost: data.property_cost,
      });
    }
    socket.on("can_buy_property", onCanBuyProperty);
    return () => socket.off("can_buy_property", onCanBuyProperty);
  }, [socket]);

  // Call backend when user confirms
  const confirmBuy = () => {
    if (!pendingBuy) return;
    socket.emit("buy_property", {
      game_id: gameId,
      player_id: playerInfo.id,
    });
    setPendingBuy(null);
  };

  const resolveTax = () => {
    setTaxCard(false);
    socket.emit("pay", {
      game_id: gameId,
      player_id: playerInfo.id,
      amount: 75
    });

  }
const resolveCardAction = () => {
  if (!drawnCard) return;

  // Use .action (not .Action) from backend
  switch (drawnCard.action) {
    case "advance_to_go":
      console.log("Advancing to go")
      socket.emit("advance_go", { game_id: gameId, player_id: playerInfo.id });
      
      break;

    case "move_to":
      socket.emit("advance", {
        game_id: gameId,
        player_id: playerInfo.id,
        spaces: (drawnCard.destination ?? 0) - (gameState.players[playerInfo.id]?.position ?? 0)
      });
      break;

    case "move_relative":
      socket.emit("advance", {
        game_id: gameId,
        player_id: playerInfo.id,
        spaces: drawnCard.amount
      });
      break;

    case "pay_money":
      socket.emit("pay", {
        game_id: gameId,
        player_id: playerInfo.id,
        amount: drawnCard.amount
      });
      break;

    case "collect_money":
      socket.emit("collect", {
        game_id: gameId,
        player_id: playerInfo.id,
        amount: drawnCard.amount
      });
      break;

    case "go_to_jail":
      console.log("Go to jail")
      socket.emit("go_to_jail", { game_id: gameId, player_id: playerInfo.id });
      break;

    // Add other actions here as you add new cards!

    default:
      // fallback, just close modal
      break;
  }
  setDrawnCard(null);
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
  const myId = playerInfo.id;
  const isMyTurn = currentTurn === myId;

  // Board index to grid
  const indexToCoord = (idx) => {
    if (idx >= 0 && idx <= 10) return [0, 10 - idx];
    if (idx >= 11 && idx <= 20) return [idx - 10, 0];
    if (idx >= 21 && idx <= 30) return [10, idx - 20];
    return [40 - idx, 10];
  };

  // Token rendering
  const tokensAt = (pos) =>
    playerOrder
      .filter((pid) => players[pid].position === pos)
      .map((pid) => {
        const pieceId = players[pid].piece;
        const pieceObj = PIECES.find((p) => p.id === pieceId);
        const label = pieceObj ? pieceObj.label : "$";
        return (
          <span
            key={pid}
            style={{
              fontSize: "2rem",
            }}
            title={players[pid].name}
          >
            {label}
          </span>
        );
      });

  const handleRoll = () => {
    if (rolling || !isMyTurn) return;
    setRolling(true);
    setTimeout(() => {
      rollDice();
      setRolling(false);
    }, 600);
  };

  // ─────────── Render ───────────
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
                  {isMyTurn && (
          <button
            onClick={() => setShowBuyHouseModal(true)}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Buy House/Hotel
          </button>
        )}
        </div>

        {/* Board container */}
        <div className="relative flex items-center justify-center">
          <div className="board">
            {Array.from({ length: 40 }, (_, idx) => {
              const [row, col] = indexToCoord(idx);
              const themeInfo = themes[themeName]?.properties?.[idx];
              const themeColor = themeInfo ? themeInfo.color : "#fff";
              const propInfo = PROPERTY_DATA[idx];
              const propState = propertiesMap[idx] || {};
              const ownerId = propState.owner;
              const numHouses = propState.houses || 0;
              const hasHotel = propState.hotel;

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
                    backgroundColor: themeColor,
                    width: "54px",
                    height: "54px",
                  }}
                  title={themeInfo ? themeInfo.displayName : `Space ${idx}`}
                >
                  <div className="absolute top-0 left-0 text-[6px] p-1">
                    {themeInfo ? themeInfo.displayName : idx}
                  </div>
                  {tokensAt(idx)}
                  {ownerId && <div className="absolute inset-0 bg-black opacity-20 rounded" />}

                  {/* House/Hotel rendering: */}
                  <div className="absolute bottom-1 left-1 flex gap-0.5">
                    {!hasHotel &&
                      [...Array(numHouses)].map((_, i) => (
                        <div
                          key={i}
                          className="inline-block w-2 h-2 bg-green-600 rounded-sm mx-[1px]"
                          title="House"
                        />
                      ))}
                    {hasHotel && (
                      <div
                        className="inline-block w-4 h-2 bg-red-600 rounded mx-[1px]"
                        title="Hotel"
                      />
                    )}
                  </div>
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
            ownership={propertiesMap}
            playerOrder={playerOrder}
            playerInfo={playerInfo}
            PROPERTY_DATA={PROPERTY_DATA}
          />
        </div>

        {/* Buy‐property modal, backend-driven only */}
        {pendingBuy && (
          <div className="modal-overlay">
            <div className="modal">
              <p className="mb-4">
                Buy{" "}
                <span className="font-semibold">{pendingBuy.name}</span> for $
                <span className="font-semibold">{pendingBuy.cost}</span>?
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

        {/*Chance/Community Chest Modals */}
        {/* {drawnCard && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{drawnCard.type === "community_chest" ? "Community Chest" : "Chance"}</h3>
              <p>{drawnCard.text}</p>
              <button
                onClick={() => {
                  resolveCardAction(drawnCard);
                  setDrawnCard(null);
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}         */}

{drawnCard && (
  <div className="modal-overlay z-50">
    <div className="modal">
      <h2 className="font-bold mb-2 text-lg">{drawnCard.type === "community_chest" ? "Community Chest" : "Chance"}</h2>
      <p className="mb-4">{drawnCard.text}</p>
      <div className="flex gap-4 justify-center">
        <button
          className="modal-button bg-blue-600 text-white px-4 py-2 rounded"
          onClick={resolveCardAction}
        >
          Resolve
        </button>
      </div>
    </div>
  </div>
)}      
{taxCard && (
  <div className="modal-overlay z-50">
    <div className="modal">
      <h2 className="font-bold mb-2 text-lg"></h2>
      <p className="mb-4">Pay Tax!</p>
      <div className="flex gap-4 justify-center">
        <button
          className="modal-button bg-blue-600 text-white px-4 py-2 rounded"
          onClick={resolveTax}
        >
          Resolve
        </button>
      </div>
    </div>
  </div>
)}     
        {/* --- Buy House/Hotel Modal & Button --- */}

        {showBuyHouseModal && (
          <BuyHouseModal
            onClose={() => setShowBuyHouseModal(false)}
            groups={eligibleGroups}
            buyHouse={(groupIdx) => {
              buyHouse(groupIdx);
              setShowBuyHouseModal(false);
            }}
          />
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
