// frontend/src/utils/themes.js

export const THEMES = {
  classic: {
    name: "Classic",
    // Map each property index → { displayName, color }
    properties: {
      1:  { displayName: "Mediterranean Avenue", color: "#8B4513" },
      3:  { displayName: "Baltic Avenue",       color: "#8B4513" },
      5:  { displayName: "Reading Railroad",    color: "#000000" },
      6:  { displayName: "Oriental Avenue",     color: "#87CEFA" },
      8:  { displayName: "Vermont Avenue",      color: "#87CEFA" },
      9:  { displayName: "Connecticut Avenue",  color: "#87CEFA" },
      // …add the rest…
    },
  },
  dark: {
    name: "Dark",
    properties: {
      1:  { displayName: "M. Ave", color: "#4E342E" },
      3:  { displayName: "B. Ave", color: "#4E342E" },
      5:  { displayName: "Railroad", color: "#424242" },
      6:  { displayName: "O. Ave", color: "#1565C0" },
      8:  { displayName: "V. Ave", color: "#1565C0" },
      9:  { displayName: "C. Ave", color: "#1565C0" },
      // …etc…
    },
  },
  // You can add more themes here (e.g. “neon”, “pastel”…)
};
