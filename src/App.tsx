import React from "react";
import NavBar from "./components/Navigation/Navigation.tsx";
import NewsTicker from "./components/NewsTicker/NewsTicker.tsx";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer.tsx";
import Channels from "./components/Channels/Channels.tsx";

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <Channels />
      <main className="p-4"> {/* Your main content goes here */}</main>
      <VideoPlayer />
      <NewsTicker />
    </div>
  );
};

export default App;
