import React from "react";
import "./Channels.scss";
import LeftArrowIcon from "../../assets/Left_Arrow.svg";

interface ChannelsProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Channels: React.FC<ChannelsProps> = ({ isOpen, setIsOpen }) => {
  const toggleMenu = () => setIsOpen(!isOpen);

  const channels = [
    { name: "Channel 2: Dain Bramage", viewers: "27.4k watching" },
    { name: "Channel 17: Music", viewers: "19.2k watching" },
    { name: "Channel 29: Skateboarding", viewers: "18.5k watching" },
    { name: "Channel 31: Horror", viewers: "17.6k watching" },
    { name: "Channel 99: Friday Night Rewind: Live", viewers: "17.4k watching" },
    { name: "Channel 104: Late Nite Movies", viewers: "15.1k watching" },
    { name: "Channel 108: Sports Bloopers", viewers: "10.9k watching" },
    { name: "Channel 145: Home Movies", viewers: "9.7k watching" },
    { name: "Channel 179: Public TV", viewers: "4.4k watching" },
    { name: "Channel 199: Documentaries", viewers: "2.6k watching" },
  ];

  return (
    <div className={`trending-container ${isOpen ? "open" : ""}`}>

      <button className={`toggle-button-left ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
        <img src={LeftArrowIcon} alt="Toggle" />
      </button>

      <div className={`trending-channels ${isOpen ? "open" : ""}`}>
        <h3>Trending Channels</h3>
        <ul>
          {channels.map((channel, index) => (
            <li key={index}>
              {channel.name}
              <h4>{channel.viewers}</h4>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Channels;

