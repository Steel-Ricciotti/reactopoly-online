// frontend/src/utils/propertyData.js

// For each property‐index, we store: displayName, cost, and color group.
// (Only showing a subset; you can expand to all 40 indices as needed.)
export const PROPERTY_DATA = {
  1: { displayName: "Mediterranean Avenue", cost: 60, group: "brown" },
  3: { displayName: "Baltic Avenue", cost: 60, group: "brown" },
  5: { displayName: "Railroad #1", cost: 200, group: "rail" },
  6: { displayName: "Oriental Avenue", cost: 100, group: "light-blue" },
  8: { displayName: "Vermont Avenue", cost: 100, group: "light-blue" },
  9: { displayName: "Connecticut Avenue", cost: 120, group: "light-blue" },
  11: { displayName: "St. Charles Place", cost: 140, group: "pink" },
  12: { displayName: "Electric Company", cost: 140, group: "utility" },
  13: { displayName: "States Avenue", cost: 140, group: "pink" },
  14: { displayName: "Virginia Avenue", cost: 160, group: "pink" },
  15: { displayName: "Railroad #2", cost: 200, group: "rail" },
  16: { displayName: "St. James Place", cost: 180, group: "orange" },
  18: { displayName: "Tennessee Avenue", cost: 180, group: "orange" },
  19: { displayName: "New York Avenue", cost: 200, group: "orange" },
  21: { displayName: "Kentucky Avenue", cost: 220, group: "red" },
  23: { displayName: "Indiana Avenue", cost: 220, group: "red" },
  24: { displayName: "Illinois Avenue", cost: 240, group: "red" },
  25: { displayName: "Railroad #3", cost: 200, group: "rail" },
  26: { displayName: "Atlantic Avenue", cost: 260, group: "yellow" },
  27: { displayName: "Ventnor Avenue", cost: 260, group: "yellow" },
  28: { displayName: "Water Works", cost: 150, group: "utility" },
  29: { displayName: "Marvin Gardens", cost: 280, group: "yellow" },
  31: { displayName: "Pacific Avenue", cost: 300, group: "green" },
  32: { displayName: "North Carolina Avenue", cost: 300, group: "green" },
  34: { displayName: "Pennsylvania Avenue", cost: 320, group: "green" },
  35: { displayName: "Railroad #4", cost: 200, group: "rail" },
  37: { displayName: "Park Place", cost: 350, group: "blue" },
  39: { displayName: "Boardwalk", cost: 400, group: "blue" },
};

// Build a reverse index: for each color group, list all indices in that group
export const GROUP_TO_INDICES = Object.values(PROPERTY_DATA).reduce(
  (acc, { displayName, cost, group }, idx) => {
    // But idx isn’t the actual key here—so instead, re‐iterate:
    return acc;
  },
  {}
);

// Actually let’s just build it programmatically:
export const GROUP_MAP = (() => {
  const map = {};
  for (const idxStr of Object.keys(PROPERTY_DATA)) {
    const idx = parseInt(idxStr, 10);
    const { group } = PROPERTY_DATA[idx];
    if (!map[group]) map[group] = [];
    map[group].push(idx);
  }
  return map;
})();
