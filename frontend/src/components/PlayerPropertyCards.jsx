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
        width: "800px", // adjusted reasonable width instead of 10000px
        maxWidth: "1000px", // adjusted reasonable width instead of 10000px
        bottom: "-150px",
        left: "50%",
        transform: "translateX(-50%)",
        flexDirection: "row",
        maxWidth: "700px",
        flexWrap: "wrap",
        gap: "8px",
      },
    },
    {
      anchor: "left",
      offsetStyle: {
        width: "150px",
        top: "51%",
        left: "-160px",
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
        maxWidth: "700px",
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

    // Group cards by group
    const groups = {};
    cardIndices.forEach((idx) => {
      const group = PROPERTY_DATA[idx]?.group || "ungrouped";
      if (!groups[group]) groups[group] = [];
      groups[group].push(idx);
    });

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
      gap: "20px",
      flexWrap: "wrap",
    };

    return (
      <div key={pid} style={style} title={playerInfo[pid]?.name || pid}>
        {Object.entries(groups).map(([groupName, groupCards]) => {
          const stackCount = groupCards.length;

          return (
            <div
              key={groupName}
              style={{
                position: "relative",
                width: "140px",
                height: "50px",
                cursor: "default",
                userSelect: "none",
              }}
              title={`${groupName} (${stackCount})`}
            >
              {/* Stack cards with offset and z-index */}
              {groupCards.map((idx, i) => {
                const { displayName, color } = PROPERTY_DATA[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      top: `${i * 4}px`,
                      left: `${i * 6}px`,
                      width: "130px",
                      height: "40px",
                      backgroundColor: color || "#ddd",
                      borderRadius: "6px",
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
                      padding: "4px 6px",
                      color: "rgba(0, 0, 0, 0.93)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.2)",
                      zIndex: i, // stack order: last card on top
                      userSelect: "none",
                    }}
                    title={displayName}
                  >
                    {displayName.split(" ").slice(0, 2).join(" ")}
                  </div>
                );
              })}

              {/* Count badge if more than 1 */}
              {stackCount > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    backgroundColor: "#e53e3e", // red-600
                    color: "white",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    fontSize: "13px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                    userSelect: "none",
                  }}
                >
                  {stackCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  });
}
