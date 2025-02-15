import React, { useState } from "react";
import NavBar from "./components/Navigation/Navigation.tsx";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer.tsx";
import Channels from "./components/Channels/Channels.tsx";
import Chatbox from "./components/Chatbox/Chatbox.tsx";
import "./App.scss";

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  console.log("isMenuOpen:", isMenuOpen);
  console.log("isChatOpen:", isChatOpen);

  return (
    <div className="app-grid">
      <NavBar />
      <div className="main-content">
        <Channels isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
        <VideoPlayer isMenuOpen={isMenuOpen} isChatOpen={isChatOpen} />
        <Chatbox isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      </div>
      <NewsTicker />
    </div>
  );
};

export default App;

