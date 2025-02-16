import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navigation/Navigation.tsx";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer.tsx";
import Channels from "./components/Channels/Channels.tsx";
import Chatbox from "./components/Chatbox/Chatbox.tsx";
import Login from "./components/Auth/Login/Login";
import Register from "./components/Auth/Register/Register";
import "./App.scss";

const MainLayout: React.FC<{ isMenuOpen: boolean; isChatOpen: boolean; setIsMenuOpen: any; setIsChatOpen: any }> = ({
  isMenuOpen,
  isChatOpen,
  setIsMenuOpen,
  setIsChatOpen,
}) => (
  <>
    <NavBar /> {/* ✅ NavBar only appears on Main Layout */}
    <div className="main-content">
      <Channels isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <VideoPlayer isMenuOpen={isMenuOpen} isChatOpen={isChatOpen} />
      <Chatbox isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
    <NewsTicker />
  </>
);

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  console.log("isMenuOpen:", isMenuOpen);
  console.log("isChatOpen:", isChatOpen);

  return (
    <Router>
      <Routes>
        {/* ✅ Main layout with video, chatbox, and sidebar */}
        <Route path="/" element={<MainLayout isMenuOpen={isMenuOpen} isChatOpen={isChatOpen} setIsMenuOpen={setIsMenuOpen} setIsChatOpen={setIsChatOpen} />} />

        {/* ✅ Auth pages (No NavBar, centered UI) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;

