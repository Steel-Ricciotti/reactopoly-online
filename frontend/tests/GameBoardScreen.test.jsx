/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoardScreen from "../src/components/GameBoardScreen";
import { GameContext } from "../src/contexts/GameContext";

test("renders board with two players on different positions and shows correct turn button", () => {
  const fakeGameState = {
    game_id: "FAKE1234",
    playerOrder: ["p1", "p2"],
    currentTurn: "p2", // it's p2's turn
    players: {
      p1: { name: "Alice", position: 5, money: 1500, inJail: false, bankrupt: false },
      p2: { name: "Bob", position: 10, money: 1500, inJail: false, bankrupt: false },
    },
  };

  // We'll pretend playerInfo is p1 (Alice), so p1 cannot roll
  const contextValue = {
    gameId: "FAKE1234",
    playerInfo: { name: "Alice", id: "p1" },
    diceResult: [2, 3],
    rollDice: jest.fn(),
    gameState: fakeGameState,
  };

  render(
    <GameContext.Provider value={contextValue}>
      <GameBoardScreen />
    </GameContext.Provider>
  );

  // Check that the cell with index 5 has an "A" token
  const cell5 = screen.getByTestId("space-5");
  expect(cell5).toHaveTextContent("A");

  // Check that the cell with index 10 has a "B" token
  // Check that the cell with index 10 (data-testid="space-10") has a "B" token
  const cell10 = screen.getByTestId("space-10");
  expect(cell10).toHaveTextContent("B");

  // Since currentTurn is "p2" (Bob), Alice's (p1) "Roll Dice" button should be disabled
  const rollBtn = screen.getByRole("button", { name: /Not Your Turn/i });
  expect(rollBtn).toBeDisabled();
});
