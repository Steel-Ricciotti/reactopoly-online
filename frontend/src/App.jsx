import React, { useContext } from "react";
import { GameProvider, GameContext } from "./contexts/GameContext";
import LandingScreen from "./components/LandingScreen";
import JoinGameScreen from "./components/JoinGameScreen";
import SettingsScreen from "./components/SettingsScreen";
import GameBoardScreen from "./components/GameBoardScreen";

function AppContent() {
  const { screen } = useContext(GameContext);

  switch (screen) {
    case "Landing":
      return <LandingScreen />;
    case "Join":
      return <JoinGameScreen />;
    case "Settings":
      return <SettingsScreen />;
    case "GameBoard":
      return <GameBoardScreen />;
    default:
      return <LandingScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
