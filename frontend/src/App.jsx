import React, { useContext } from "react";
import { GameProvider, GameContext } from "./contexts/GameContext";
import LandingScreen from "./components/LandingScreen";
import JoinGameScreen from "./components/JoinGameScreen";
import SettingsScreen from "./components/SettingsScreen";
import GameBoardScreen from "./components/GameBoardScreen";
import PieceSelectionScreen  from "./components/PieceSelectionScreen";
import LobbyScreen from "./components/LobbyScreen";
import BrowseLobbyScreen from "./components/BrowseLobbyScreen"
import VideoScreen from "./components/VideoScreen"
function AppContent() {
  const { screen } = useContext(GameContext);

  switch (screen) {
    case "Landing":
      return <LandingScreen />;
    case "Join":
      return <JoinGameScreen />;
    case "PieceSelection":
      return <PieceSelectionScreen />;      
    case "Settings":
      return <SettingsScreen />;
    case "GameBoard":
      return <GameBoardScreen />;
    case "Lobby":
      return <LobbyScreen />;      
    case "BrowseLobby":
      return <BrowseLobbyScreen/>;
    case "Video":
      return <VideoScreen/>;
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
