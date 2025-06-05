import React, { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export default function SettingsScreen() {
  const { setScreen, themeName, setThemeName, themes } = useContext(GameContext);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Select Theme:</label>
        <select
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {Object.keys(themes).map((key) => (
            <option key={key} value={key}>
              {themes[key].name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="text-gray-600 underline"
        onClick={() => setScreen("Landing")}
      >
        ← Back
      </button>
    </div>
  );
}
