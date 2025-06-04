/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LandingScreen from "../src/components/LandingScreen";
import { GameContext } from "../src/contexts/GameContext";

test("LandingScreen renders and calls createGame on button click", () => {
  const createGameMock = jest.fn();
  const joinGameMock = jest.fn();
  const setScreenMock = jest.fn();

  render(
    <GameContext.Provider
      value={{
        createGame: createGameMock,
        joinGame: joinGameMock,
        setScreen: setScreenMock,
      }}
    >
      <LandingScreen />
    </GameContext.Provider>
  );

  // Enter a player name
  const nameInput = screen.getByPlaceholderText("Your Name");
  fireEvent.change(nameInput, { target: { value: "Alice" } });

  // Click “New Game”
  const newGameBtn = screen.getByText("New Game");
  fireEvent.click(newGameBtn);

  expect(createGameMock).toHaveBeenCalledWith("Alice");
});
