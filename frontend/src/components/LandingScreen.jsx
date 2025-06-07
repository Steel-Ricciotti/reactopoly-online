import React, { useState, useContext, useEffect, useRef } from "react";
import { GameContext } from "../contexts/GameContext";

export default function LandingScreen() {
  const { createGame, joinGame, setScreen } = useContext(GameContext);
  const [playerName, setPlayerName] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    // Save original styles
    const originalBgImage = document.body.style.backgroundImage;
    const originalBgColor = document.body.style.backgroundColor;

    // Override for landing screen
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#f0f0f0"; // or white

    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.muted = true; // Start muted for autoplay
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked");
      });
    }

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundImage = originalBgImage;
      document.body.style.backgroundColor = originalBgColor;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

const handleUnmute = () => {
  if (audioRef.current) {
    audioRef.current.muted = false;
    audioRef.current.play().catch(() => {
      console.log("Failed to play after unmute");
    });
    setMuted(false);
  }
};
  return (
    <>
      <audio ref={audioRef} src="/music/chill_piano.mp3" loop playsInline muted autoPlay />
      
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 relative">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">Reactopoly Online</h1>
           <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded w-full mb-4"
            onClick={() => createGame(playerName)}
            disabled={!playerName.trim()}
          >
            New Game
          </button>

          <div className="mb-4 flex gap-2">
            {/* <input
              type="text"
              placeholder="Enter Game ID"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            /> */}
            {/* <button
              className="bg-red-600 hover:bg-red-700 transition-colors text-white rounded px-3 py-2 w-40"
              onClick={() => joinGame(gameIdInput, playerName)}
              disabled={!gameIdInput.trim() || !playerName.trim()}
            >
              Join Game
            </button> */}
          </div>

          <button
            className="bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2 rounded w-full mb-6"
            onClick={() => setScreen("BrowseLobby")}
          >
            Browse Lobby
          </button>

          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 py-2 rounded w-full mb-6"
            onClick={() => setScreen("Settings")}
          >
            Settings
          </button>
          <button
            className="bg-pink-300 hover:bg-gray-400 text-gray-800 font-bold px-4 py-2 rounded w-full mb-6"
            onClick={() => setScreen("Video")}
          >
            Tutorial
          </button>          
        </div>

        {/* Unmute button */}
        {muted && (
          <button
            onClick={handleUnmute}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow"
            aria-label="Unmute music"
          >
            🔈 Unmute Music
          </button>
        )}

        {/* Attribution footer */}
        <footer className="absolute bottom-2 text-xs text-gray-500 select-none">
          Music:{" "}
          <a
            href="https://www.bensound.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            bensound.com
          </a>{" "}
          | Artist: Benjamin Tissot | License code: XFG6NZWGCV7XHY9V
        </footer>
      </div>
    </>
  );
}
