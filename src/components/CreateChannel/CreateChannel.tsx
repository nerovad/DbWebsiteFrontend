import React, { useEffect, useRef } from "react";
import "./CreateChannel.scss";
import CreateChannel from "./CreateChannel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  excludeClickId?: string; // optional: e.g. "remote-button"
}

const CreateChannelOverlay: React.FC<Props> = ({ isOpen, onClose, excludeClickId }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const excludeEl = excludeClickId ? document.getElementById(excludeClickId) : null;

      if (
        boxRef.current &&
        !boxRef.current.contains(event.target as Node) &&
        (!excludeEl || !excludeEl.contains(event.target as Node))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // prevent background scroll (optional)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, excludeClickId]);

  if (!isOpen) return null;

  return (
    <div className="create-channel-overlay">
      <div className="create-channel-content" ref={boxRef}>
        <button className="close-btn" onClick={onClose} aria-label="Close create channel">
          X
        </button>
        <h2>Create Channel</h2>
        <CreateChannelForm />
      </div>
    </div>
  );
};

export default CreateChannelOverlay;

