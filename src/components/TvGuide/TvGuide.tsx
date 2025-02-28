import React, { useEffect, useRef } from "react";
import "./TvGuide.scss";

interface TvGuideProps {
  isOpen: boolean;
  closeGuide: () => void;
}

const TvGuide: React.FC<TvGuideProps> = ({ isOpen, closeGuide }) => {
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const remoteButton = document.getElementById("remote-button"); // Adjust based on your actual ID or class

      if (
        guideRef.current &&
        !guideRef.current.contains(event.target as Node) &&
        remoteButton &&
        !remoteButton.contains(event.target as Node) // Prevent closing if clicking the remote button
      ) {
        closeGuide();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeGuide]);

  if (!isOpen) return null;

  return (
    <div className="tv-guide-overlay">
      <div className="tv-guide-content" ref={guideRef}>
        <button className="close-btn" onClick={closeGuide}>X</button>
        <h2>TV Guide</h2>
        <ul>
          <li>Channel 1 - Dain Bramage Originals</li>
          <li>Channel 2 - Music</li>
          <li>Channel 3 - Skateboarding</li>
          <li>Channel 4 - Horror</li>
        </ul>
      </div>
    </div>
  );
};

export default TvGuide;
