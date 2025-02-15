import React, { useState } from "react";
import NavBar from "./components/Navigation/Navigation.tsx";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer.tsx";
import Channels from "./components/Channels/Channels.tsx";
import "./App.scss";

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app-grid">
      <NavBar />
      <div className="main-content">
        <Channels isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
        <VideoPlayer isMenuOpen={isMenuOpen} />
      </div>
      <NewsTicker />
    </div>
  );
};

export default App;

