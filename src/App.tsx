import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navigation/Navigation.tsx";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import TvGuide from "./components/TvGuide/TvGuide.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer.tsx";
import Channels from "./components/Menu/Menu.tsx";
import Chatbox from "./components/Chatbox/Chatbox.tsx";
import Auth from "./components/Auth/Auth.tsx";
import "./App.scss";


const MainLayout: React.FC<{
  isMenuOpen: boolean;
  isChatOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isGuideOpen: boolean;
  setIsGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  videoControls: any; // ✅ Added video controls prop
  isAuthOpen: boolean;
  setIsAuthOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authMode: "login" | "register";
  setAuthMode: React.Dispatch<React.SetStateAction<"login" | "register">>;
}> = ({
  isMenuOpen,
  isChatOpen,
  setIsMenuOpen,
  setIsChatOpen,
  isGuideOpen,
  setIsGuideOpen,
  isLoggedIn,
  setIsLoggedIn,
  videoControls, // ✅ Receive video controls
  isAuthOpen,
  setIsAuthOpen,
  authMode,
  setAuthMode
}) => (
    <>
      <NavBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setIsGuideOpen={setIsGuideOpen}
        setIsAuthOpen={setIsAuthOpen}
        setAuthMode={setAuthMode}
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


    </>
  );

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // ✅ Auth Modal State (Fixing Hook Error)
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

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
              isGuideOpen={isGuideOpen}
              setIsGuideOpen={setIsGuideOpen}
              isAuthOpen={isAuthOpen} // ✅ Pass Auth state
              setIsAuthOpen={setIsAuthOpen}
              authMode={authMode}
              setAuthMode={setAuthMode}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              videoControls={videoControls} // ✅ Pass video controls to MainLayout
            />
          }
        />
      </Routes>
      {isAuthOpen && (
        <Auth
          setIsLoggedIn={setIsLoggedIn}
          setIsAuthOpen={setIsAuthOpen}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />
      )}
    </Router>
  );
};

export default App;
