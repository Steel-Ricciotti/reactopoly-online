// tests/GameContext.test.jsx
/**
 * @jest-environment jsdom
 */
import React, { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { GameProvider, GameContext } from "../src/contexts/GameContext";

// === NEW MOCK ===
// We return an `io()` that tracks callbacks for "game_created" and "player_joined".
// As soon as a "game_created" listener is registered, we invoke it with { game_id: "ABC999" }.
// Immediately after calling that, we also fire any "player_joined" listener for Alice.
jest.mock("socket.io-client", () => {
  return {
    io: () => {
      let handlers = {};

      return {
        on: (event, cb) => {
          handlers[event] = cb;

          if (event === "game_created") {
            // Fire game_created first
            setTimeout(() => {
              cb({ game_id: "ABC999" });
              // Immediately after, also fire a player_joined for Alice
              if (handlers["player_joined"]) {
                handlers["player_joined"]({
                  player_id: "ABC123",
                  player_name: "Alice",
                });
              }
            }, 0);
          }
        },
        emit: jest.fn((eventName, data) => {
          // You can inspect calls to socket.emit if needed, but no extra behavior is required here.
        }),
      };
    },
  };
});

function TestComponent() {
  const {
    screen: currentScreen,
    createGame,
    gameId,
    playerInfo,
  } = useContext(GameContext);

  return (
    <div>
      <span data-testid="screen">{currentScreen}</span>
      <span data-testid="game-id">{gameId}</span>
      <span data-testid="player-name">{playerInfo.name}</span>
      <button onClick={() => createGame("Alice")}>CreateAlice</button>
    </div>
  );
}

describe("GameContext (React 18–compatible)", () => {
  test("calling createGame changes screen to GameBoard and sets player name", async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    userEvent.click(screen.getByText("CreateAlice"));

    // Wait for both game_created and player_joined callbacks to replay
    await waitFor(() =>
      expect(screen.getByTestId("screen")).toHaveTextContent("GameBoard")
    );
    expect(screen.getByTestId("game-id")).toHaveTextContent("ABC999");
    expect(screen.getByTestId("player-name")).toHaveTextContent("Alice");
  });
});
