// frontend/src/components/PlayerPropertyCards.jsx
import React from "react";

export default function PlayerPropertyCards({
  ownership = {},
  playerOrder = [],
  playerInfo = {},
  PROPERTY_DATA = {},
}) {
  // Build map: playerId → array of property indices they own
  const ownedByPlayer = {};
  for (const [idxStr, ownerId] of Object.entries(ownership)) {
    const idx = parseInt(idxStr, 10);
    if (!ownedByPlayer[ownerId]) ownedByPlayer[ownerId] = [];
    ownedByPlayer[ownerId].push(idx);
  }

  const seats = [
    {
      anchor: "bottom",
      offsetStyle: {
        bottom: "-120px",
        left: "50%",
        transform: "translateX(-50%)",
        flexDirection: "row",
        maxWidth: "560px",
        flexWrap: "wrap",
        gap: "8px",
      },
    },
    {
      anchor: "left",
      offsetStyle: {
        top: "50%",
        left: "-120px",
        transform: "translateY(-50%)",
        flexDirection: "column",
        maxHeight: "560px",
        flexWrap: "wrap",
        gap: "8px",
      },
    },
    {
      anchor: "top",
      offsetStyle: {
        top: "-120px",
        left: "50%",
        transform: "translateX(-50%)",
        flexDirection: "row",
        maxWidth: "560px",
        flexWrap: "wrap",
        gap: "8px",
      },
    },
    {
      anchor: "right",
      offsetStyle: {
        top: "50%",
        right: "-120px",
        transform: "translateY(-50%)",
        flexDirection: "column",
        maxHeight: "560px",
        flexWrap: "wrap",
        gap: "8px",
      },
    },
  ];

  return playerOrder.slice(0, 4).map((pid, seatIndex) => {
    const cardIndices = ownedByPlayer[pid] || [];
    if (cardIndices.length === 0) return null;

    const style = {
      position: "absolute",
      display: "flex",
      ...seats[seatIndex].offsetStyle,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "10px",
      padding: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
      border: "1px solid #ccc",
      zIndex: 20,
    };

    return (
      <div key={pid} style={style}>
        {cardIndices.map((idx) => {
          const { displayName, color } = PROPERTY_DATA[idx];
          return (
            <div
              key={idx}
              className="text-xs font-semibold text-center truncate"
              style={{
                width: "70px",
                height: "40px",
                backgroundColor: color || "#ddd",
                borderRadius: "6px",
                boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
                padding: "4px 6px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
              }}
              title={displayName}
            >
              {displayName.split(" ").slice(0, 2).join(" ")}
            </div>
          );
        })}
      </div>
    );
  });
}
