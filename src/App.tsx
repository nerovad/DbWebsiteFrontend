import React from "react";
import NavBar from "./components/Navigation/Navigation.tsx";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <main className="p-4"> {/* Your main content goes here */}</main>
      <VideoPlayer />
      <NewsTicker />
    </div>
  );
};

export default App;
