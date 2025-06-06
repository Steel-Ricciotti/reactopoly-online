/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoardScreen from "../src/components/GameBoardScreen";
import { GameContext } from "../src/contexts/GameContext";

const fakeGameState = {
  game_id: "FAKE1234",
  playerOrder: ["p1", "p2"],
  currentTurn: "p2", // Bob’s turn
  players: {
    p1: { name: "Alice", position: 1, money: 1500, inJail: false, bankrupt: false },
    p2: { name: "Bob", position: 3, money: 1500, inJail: false, bankrupt: false },
  },
  properties: {
    1: "p1", // Alice owns space 1
    3: "p2", // Bob owns space 3
    // others remain null
  },
};

const contextValue = {
  gameId: "FAKE1234",
  playerInfo: { name: "Alice", id: "p1" },
  diceResult: [2, 3],
  rollDice: jest.fn(),
  gameState: fakeGameState,
  themeName: "classic",
  themes: {
    classic: {
      name: "Classic",
      properties: {
        1: { displayName: "Med Ave", color: "#8B4513" },
        3: { displayName: "Balt Ave", color: "#8B4513" },
      },
    },
  },
};

test("renders themed board with owned properties and correct turn button", () => {
  render(
    <GameContext.Provider value={contextValue}>
      <GameBoardScreen />
    </GameContext.Provider>
  );

  // Space 1 is "Med Ave" (Alice owns it), Alice’s token should appear there
  const cell1 = screen.getByTestId("space-1");
  expect(cell1).toHaveTextContent("Med Ave");
  expect(cell1).toHaveTextContent("A");

  // Space 3 is "Balt Ave" (Bob owns it), Bob’s token should appear there
  const cell3 = screen.getByTestId("space-3");
  expect(cell3).toHaveTextContent("Balt Ave");
  expect(cell3).toHaveTextContent("B");

  // It's Bob's turn, so Alice's "Not Your Turn" button appears
  const notYourTurnBtn = screen.getByRole("button", { name: /Not Your Turn/i });
  expect(notYourTurnBtn).toBeDisabled();
});
