// src/utils/cards.js

export const COMMUNITY_CHEST = [
  { id: 1, text: "Advance to Go (Collect $200)", action: "advance_go" },
  { id: 2, text: "Bank error in your favor. Collect $200.", action: "collect", amount: 200 },
  { id: 3, text: "Doctor's fees. Pay $50.", action: "pay", amount: 50 },
  // ... add more cards!
];

export const CHANCE = [
  { id: 1, text: "Advance to Illinois Ave.", action: "advance", space: 24 },
  { id: 2, text: "Go back 3 spaces.", action: "move_relative", amount: -3 },
  { id: 3, text: "Pay poor tax of $15.", action: "pay", amount: 15 },
  // ... add more cards!
];
