import React, { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export default function SettingsScreen() {
  const { setScreen } = useContext(GameContext);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <p className="mb-2">(Theme switching will be implemented in Iter 2.)</p>
      <button
        className="text-gray-600 underline"
        onClick={() => setScreen("Landing")}
      >
        ← Back
      </button>
    </div>
  );
}
