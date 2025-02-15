import React from "react";
import "./Chatbox.scss";
import RightArrowIcon from "../../assets/Right_Arrow.svg"; // Add this asset

interface ChatboxProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chatbox: React.FC<ChatboxProps> = ({ isOpen, setIsOpen }) => {
  const toggleChatbox = () => setIsOpen(!isOpen);

  return (
    <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
      <button className="toggle-button-right" onClick={toggleChatbox}>
        <img src={RightArrowIcon} alt="Toggle Chat" />
      </button>
      <div className={`chatbox-content ${isOpen ? "open" : ""}`}>
        <h3>Live Chat</h3>
        <div className="messages">
          <p>User1: Hey, what's up?</p>
          <p>User2: Loving this stream!</p>
          <p>User3: When's the next episode?</p>
        </div>
        <input type="text" placeholder="Type a message..." />
      </div>
    </div>
  );
};

export default Chatbox;

