import React, { useState } from "react";
import Draggable from "react-draggable"; // Allows dragging
import "./FloatingRemote.scss";

interface FloatingRemoteProps {
  goToNextVideo: () => void;
  goToPreviousVideo: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  openGuide: () => void;
}

const FloatingRemote: React.FC<FloatingRemoteProps> = ({ goToNextVideo, goToPreviousVideo, toggleMute, toggleFullscreen, openGuide }) => {
  const [isOn, setIsOn] = useState(true);

  return (
    <Draggable>
      <div className="floating-remote">
        <button className="power-btn" onClick={() => setIsOn(!isOn)}>
          {isOn ? "" : "⚪"} {/* Toggle power indicator */}
        </button>
        <button className="channel-up" onClick={goToNextVideo}></button>
        <button className="channel-down" onClick={goToPreviousVideo}></button>
        <button className="mute-btn" onClick={toggleMute}></button>
        <button className="fullscreen-btn" onClick={toggleFullscreen}>⛶</button>
        <button className="guide-btn" onClick={openGuide}></button>
      </div>
    </Draggable>
  );
};

export default FloatingRemote;

