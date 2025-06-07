// frontend/src/utils/propertyData.js

// For each property‐index, we store: displayName, cost, and color group.
// (Only showing a subset; you can expand to all 40 indices as needed.)
export const PROPERTY_DATA = {
  1:  { displayName: "Mediterranean Avenue", color: "rgba(123, 63, 0, 0.6)", cost: 60, group: "brown" },
  3:  { displayName: "Baltic Avenue",       color: "rgba(123, 63, 0, 0.6)", cost: 60, group: "brown" },
  5:  { displayName: "Railroad #1",         color: "rgba(0, 0, 0, 0.8)",    cost: 200, group: "rail" },
  6:  { displayName: "Oriental Avenue",     color: "rgba(173, 216, 230, 0.8)", cost: 100, group: "light-blue" },
  8:  { displayName: "Vermont Avenue",      color: "rgba(173, 216, 230, 0.8)", cost: 100, group: "light-blue" },
  9:  { displayName: "Connecticut Avenue",  color: "rgba(173, 216, 230, 0.8)", cost: 120, group: "light-blue" },
  11: { displayName: "St. Charles Place",   color: "rgba(255, 192, 203, 0.8)", cost: 140, group: "pink" },
  12: { displayName: "Electric Company",    color: "rgba(192, 192, 192, 0.8)", cost: 140, group: "utility" },
  13: { displayName: "States Avenue",       color: "rgba(255, 192, 203, 0.8)", cost: 140, group: "pink" },
  14: { displayName: "Virginia Avenue",     color: "rgba(255, 192, 203, 0.8)", cost: 160, group: "pink" },
  15: { displayName: "Railroad #2",         color: "rgba(0, 0, 0, 0.8)",    cost: 200, group: "rail" },
  16: { displayName: "St. James Place",     color: "rgba(255, 165, 0, 0.8)", cost: 180, group: "orange" },
  18: { displayName: "Tennessee Avenue",    color: "rgba(255, 165, 0, 0.8)", cost: 180, group: "orange" },
  19: { displayName: "New York Avenue",     color: "rgba(255, 165, 0, 0.8)", cost: 200, group: "orange" },
  21: { displayName: "Kentucky Avenue",     color: "rgba(255, 0, 0, 0.8)",  cost: 220, group: "red" },
  23: { displayName: "Indiana Avenue",      color: "rgba(255, 0, 0, 0.8)",  cost: 220, group: "red" },
  24: { displayName: "Illinois Avenue",     color: "rgba(255, 0, 0, 0.8)",  cost: 240, group: "red" },
  25: { displayName: "Railroad #3",         color: "rgba(0, 0, 0, 0.8)",    cost: 200, group: "rail" },
  26: { displayName: "Atlantic Avenue",     color: "rgba(255, 255, 0, 0.8)",cost: 260, group: "yellow" },
  27: { displayName: "Ventnor Avenue",      color: "rgba(255, 255, 0, 0.8)",cost: 260, group: "yellow" },
  28: { displayName: "Water Works",          color: "rgba(192, 192, 192, 0.8)", cost: 150, group: "utility" },
  29: { displayName: "Marvin Gardens",      color: "rgba(255, 255, 0, 0.8)",cost: 280, group: "yellow" },
  31: { displayName: "Pacific Avenue",      color: "rgba(0, 128, 0, 0.8)",  cost: 300, group: "green" },
  32: { displayName: "North Carolina Avenue", color: "rgba(0, 128, 0, 0.8)", cost: 300, group: "green" },
  34: { displayName: "Pennsylvania Avenue", color: "rgba(0, 128, 0, 0.8)",  cost: 320, group: "green" },
  35: { displayName: "Railroad #4",         color: "rgba(0, 0, 0, 0.8)",    cost: 200, group: "rail" },
  37: { displayName: "Park Place",          color: "rgba(0, 0, 255, 0.8)",  cost: 350, group: "blue" },
  39: { displayName: "Boardwalk",            color: "rgba(0, 0, 255, 0.8)",  cost: 400, group: "blue" },
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
