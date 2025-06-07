import React, { useEffect, useState, useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export default function BrowseLobbyScreen() {
  const { socket, setScreen, joinGame } = useContext(GameContext);
  const [lobbies, setLobbies] = useState([]);

  useEffect(() => {
    
    // if (!socket) return;
    console.log("List Lobbies")
    socket.emit("list_lobbies");
    socket.on("lobby_list", setLobbies);

    return () => socket.off("lobby_list", setLobbies);
  }, [socket]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Available Lobbies</h2>
        {lobbies.length === 0 ? (
          <div className="text-gray-500 text-center">No games found.</div>
        ) : (
          <ul>
            {lobbies.map((lobby) => (
              <li key={lobby.game_id} className="flex items-center justify-between mb-3 p-2 border-b">
                <span>
                  <strong>{lobby.game_id}</strong> – Players: {lobby.num_players}
                </span>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => {
                    // You can also prompt for a name here
                    const name = prompt("Enter your name:");
                    if (name) joinGame(lobby.game_id, name);
                  }}
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
        <button className="mt-6 text-gray-600 underline" onClick={() => setScreen("Landing")}>
          ← Back
        </button>
      </div>
    </div>
  );
}
