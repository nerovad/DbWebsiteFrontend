import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navigation/Navigation.tsx";
import FloatingRemote from "./components/FloatingRemote/FloatingRemote";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import TvGuide from "./components/TvGuide/TvGuide.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer.tsx";
import Channels from "./components/Channels/Channels.tsx";
import Chatbox from "./components/Chatbox/Chatbox.tsx";
import Login from "./components/Auth/Login/Login";
import Register from "./components/Auth/Register/Register";
import "./App.scss";

const MainLayout: React.FC<{
  isMenuOpen: boolean;
  isChatOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isRemoteOpen: boolean;
  setIsRemoteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isGuideOpen: boolean;
  setIsGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  videoControls: any; // ✅ Added video controls prop
}> = ({
  isMenuOpen,
  isChatOpen,
  setIsMenuOpen,
  setIsChatOpen,
  isRemoteOpen,
  setIsRemoteOpen,
  isGuideOpen,
  setIsGuideOpen,
  isLoggedIn,
  setIsLoggedIn,
  videoControls, // ✅ Receive video controls
}) => (
    <>
      <NavBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setIsRemoteOpen={setIsRemoteOpen}
        setIsGuideOpen={setIsGuideOpen}
        {...videoControls} // ✅ Pass video controls to NavBar
      />
      <div className="main-content">
        <Channels isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

        <VideoPlayer
          isMenuOpen={isMenuOpen}
          isChatOpen={isChatOpen}
          setIsGuideOpen={setIsGuideOpen}
          setVideoControls={videoControls.setVideoControls}
        />
        <Chatbox isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      </div>
      <NewsTicker />

      {isGuideOpen && <TvGuide isOpen={isGuideOpen} closeGuide={() => setIsGuideOpen(false)} />}

      <FloatingRemote
        isRemoteOpen={isRemoteOpen}
        setIsRemoteOpen={setIsRemoteOpen}
        goToNextVideo={videoControls.goToNextVideo} // ✅ Use real functions
        goToPreviousVideo={videoControls.goToPreviousVideo}
        toggleMute={videoControls.toggleMute}
        toggleFullscreen={videoControls.toggleFullscreen}
      />
    </>
  );

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isRemoteOpen, setIsRemoteOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // ✅ Video State (Received from VideoPlayer.tsx)

  const [videoControls, setVideoControls] = useState<any>({
    currentIndex: 0,
    setCurrentIndex: () => { },
    videoLinks: [],
    videoRef: null,
    goToNextVideo: () => { },
    goToPreviousVideo: () => { },
    toggleMute: () => { },
    toggleFullscreen: () => { },
    loadVideo: () => { },
    setVideoControls: (controls: any) => setVideoControls((prev) => ({ ...prev, ...controls })), // ✅ Persist state updates
  });


  // ✅ Listen for changes in localStorage
  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));

    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Main layout with video, chatbox, and sidebar */}
        <Route
          path="/"
          element={
            <MainLayout
              isMenuOpen={isMenuOpen}
              isChatOpen={isChatOpen}
              setIsMenuOpen={setIsMenuOpen}
              setIsChatOpen={setIsChatOpen}
              isRemoteOpen={isRemoteOpen}
              setIsRemoteOpen={setIsRemoteOpen}
              isGuideOpen={isGuideOpen}
              setIsGuideOpen={setIsGuideOpen}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              videoControls={videoControls} // ✅ Pass video controls to MainLayout
            />
          }
        />

        {/* Auth pages (No NavBar, centered UI) */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
