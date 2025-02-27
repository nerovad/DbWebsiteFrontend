import React from "react";
import "./TvGuide.scss";

interface TvGuideProps {
  isOpen: boolean;
  closeGuide: () => void;
}

const TvGuide: React.FC<TvGuideProps> = ({ isOpen, closeGuide }) => {
  if (!isOpen) return null; // Hide when closed

  return (
    <div className="tv-guide-overlay">
      <button className="close-btn" onClick={closeGuide}>❌</button>
      <h2>📺 TV Guide</h2>
      <ul>
        <li>🎥 Channel 1 - Dain Bramage Originals</li>
        <li>🎶 Channel 2 - Music</li>
        <li>🛹 Channel 3 - Skateboarding</li>
        <li>🎃 Channel 4 - Horror</li>
      </ul>
    </div>
  );
};

export default TvGuide;
