import React from "react";
import "./Menu.scss";
import LeftArrowIcon from "../../assets/Left_Arrow.svg";

interface UtilitiesProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Utilities: React.FC<UtilitiesProps> = ({ isOpen, setIsOpen }) => {
  const toggleMenu = () => setIsOpen(!isOpen);

  const utilities = [
    { name: "Voting Ballot", description: "Rate and support your favorite entries." },
    { name: "Battle Royale", description: "Films go head-to-head. You decide the winner." },
    { name: "Tournament Bracket", description: "See who’s advancing in the competition." },
    { name: "All Time Leaderboard", description: "Top-ranked filmmakers." },
  ];

  return (
    <div className={`utilities-container ${isOpen ? "open" : ""}`}>

      <button className={`toggle-button-left ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
        <img src={LeftArrowIcon} alt="Toggle" />
      </button>

      <div className={`utilities-menu ${isOpen ? "open" : ""}`}>
        <h3>The Pit</h3>
        <ul>
          {utilities.map((utility, index) => (
            <li key={index}>
              <strong>{utility.name}</strong>
              <p>{utility.description}</p>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Utilities;

