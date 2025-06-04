
// import io from "socket.io-client";
/**
 * @jest-environment jsdom
 */
import React, { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/";
import { GameProvider, GameContext } from "../src/contexts/GameContext";
import io from "socket.io-client";
// Top‐level mock for socket.io-client:
jest.mock("socket.io-client", () => {
  return {
    io: () => ({
      on: (event, cb) => {
        if (event === "game_created") {
          // Simulate backend sending back a game_id
          setTimeout(() => cb({ game_id: "ABC999" }), 0);
        }
      },
      emit: jest.fn(),
    }),
  };
});

function TestComponent() {
  const {
    screen: currentScreen,
    createGame,
    joinGame,
    setScreen,
    gameId,
    playerInfo,
  } = useContext(GameContext);

  return (
    <div>
      <span data-testid="screen">{currentScreen}</span>
      <span data-testid="game-id">{gameId}</span>
      <span data-testid="player-name">{playerInfo.name}</span>
      <button onClick={() => createGame("Alice")}>CreateAlice</button>
      <button onClick={() => joinGame("XYZ123", "Bob")}>JoinBob</button>
      <button onClick={() => setScreen("Settings")}>GoSettings</button>
    </div>
  );
}

describe("GameContext (React 18–compatible)", () => {
  test("starts at Landing screen by default", () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    expect(screen.getByTestId("screen")).toHaveTextContent("Landing");
  });

  test("calling setScreen updates the screen value", async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    await userEvent.click(screen.getByText("GoSettings"));
    expect(screen.getByTestId("screen")).toHaveTextContent("Settings");
  });

  test("calling createGame changes screen to GameBoard and sets player name", async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    await userEvent.click(screen.getByText("CreateAlice"));

    await waitFor(() =>
      expect(screen.getByTestId("screen")).toHaveTextContent("GameBoard")
    );

    expect(screen.getByTestId("game-id")).toHaveTextContent("ABC999");
    expect(screen.getByTestId("player-name")).toHaveTextContent("Alice");
  });
});
