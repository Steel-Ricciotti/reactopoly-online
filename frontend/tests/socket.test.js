import { initSocket, createGame, joinGame } from "../src/utils/socket";
import { io as mockIo } from "socket.io-client";

jest.mock("socket.io-client");

describe("socket utils", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
    };
    mockIo.mockReturnValue(mockSocket);
  });

  test("initSocket calls io and sets up connect/disconnect listeners", () => {
    const sock = initSocket();
    expect(mockIo).toHaveBeenCalledWith("http://localhost:8000");
    expect(typeof sock).toBe("object");
    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
  });

  test("createGame emits create_game", () => {
    createGame(mockSocket);
    expect(mockSocket.emit).toHaveBeenCalledWith("create_game", {});
  });

  test("joinGame emits join_game with correct payload", () => {
    joinGame(mockSocket, "ABC123", "Bob");
    expect(mockSocket.emit).toHaveBeenCalledWith("join_game", {
      game_id: "ABC123",
      player_name: "Bob",
    });
  });
});
