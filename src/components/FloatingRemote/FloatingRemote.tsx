import React from "react";
import Draggable from "react-draggable";
import "./FloatingRemote.scss";

interface FloatingRemoteProps {
  isRemoteOpen: boolean;
  setIsRemoteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  goToNextVideo: () => void;
  goToPreviousVideo: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  openGuide: () => void;
}

const FloatingRemote: React.FC<FloatingRemoteProps> = ({
  isRemoteOpen,
  setIsRemoteOpen,
  goToNextVideo,
  goToPreviousVideo,
  toggleMute,
  toggleFullscreen,
  openGuide
}) => {
  if (!isRemoteOpen) return null; // ✅ Hide remote when it's closed

  return (
    <Draggable>
      <div className="floating-remote">
        <button className="power-btn" onClick={() => {
          console.log("❌ Closing Remote");
          setIsRemoteOpen(false);
        }}>❌</button>

        <button className="channel-up" onClick={() => {
          console.log("🔼 goToNextVideo() called");
          goToNextVideo(); // ✅ Ensure it's actually called
        }}>Ch+</button>

        <button className="channel-down" onClick={() => {
          console.log("🔽 goToPreviousVideo() called");
          goToPreviousVideo();
        }}>Ch-</button>

        <button className="mute-btn" onClick={() => {
          console.log("🔇 toggleMute() called");
          toggleMute();
        }}>Mute</button>

        <button className="fullscreen-btn" onClick={() => {
          console.log("⛶ toggleFullscreen() called");
          toggleFullscreen();
        }}>Full</button>

        <button className="guide-btn" onClick={() => {
          console.log("📺 openGuide() called");
          openGuide();
        }}>Guide</button>
      </div>
    </Draggable>
  );
};

export default FloatingRemote;
