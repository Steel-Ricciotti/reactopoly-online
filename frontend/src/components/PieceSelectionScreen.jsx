import React, { useContext, useState } from "react";
import { GameContext } from "../contexts/GameContext";

const PIECES = [
  { id: "car", label: "🚗" },
  { id: "hat", label: "🎩" },
  { id: "dog", label: "🐕" },
  { id: "ship", label: "🚢" },
  { id: "wheelbarrow", label: "🛒" },
];

export default function PieceSelectionScreen() {
  const {
    gameId,
    playerInfo,
    choosePiece,
    setScreen,
    selectedPiece,
  } = useContext(GameContext);

  const [selected, setSelected] = useState(selectedPiece);

  // Guard: Only show when context is available
  if (!gameId || !playerInfo.name) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <p className="text-red-600 mb-2">Initializing game…</p>
          <button onClick={() => setScreen("Landing")} className="underline text-xs">
            Back to Landing
          </button>
        </div>
      </div>
    );
  }

  const handleSelect = (piece) => {
    setSelected(piece.id);
  };

  const handleConfirm = () => {
    if (!selected) return;
    choosePiece(selected);
    // After this, screen will go to Lobby!
    // setScreen("Lobby");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Select Your Piece
        </h2>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {PIECES.map((piece) => (
            <button
              key={piece.id}
              onClick={() => handleSelect(piece)}
              className={`text-4xl p-4 rounded-lg border-4 ${
                selected === piece.id
                  ? "border-blue-600 bg-blue-100"
                  : "border-transparent hover:bg-gray-100"
              }`}
              aria-pressed={selected === piece.id}
            >
              {piece.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            disabled={!selected}
            onClick={handleConfirm}
            className={`px-6 py-2 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}