import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaVolumeMute, FaExpand } from "react-icons/fa";
import Logo from "../../assets/J0013_DAIN_BRAMAGE_LOGO_V01.svg";
import TvGuideIcon from "../../assets/DBwebsiteIconDBTV.svg";
import "./Navigation.scss";

interface NavBarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  videoLinks: { src: string; channel: string }[];
  videoRef: React.RefObject<HTMLVideoElement>;
  setIsGuideOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  goToNextVideo: () => void;
  goToPreviousVideo: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  loadVideo: (src: string) => void;
}

const SearchNavBar: React.FC<NavBarProps> = ({
  isLoggedIn,
  setIsLoggedIn,
  currentIndex,
  setCurrentIndex,
  videoLinks,
  videoRef,
  setIsGuideOpen,
  goToNextVideo,
  goToPreviousVideo,
  toggleMute,
  toggleFullscreen,
  loadVideo,
  setIsAuthOpen,
  setAuthMode,
}) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [channelInput, setChannelInput] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT
    setIsLoggedIn(false);
  };

  const goToChannel = () => {
    const channelNumber = parseInt(channelInput, 10);
    if (!isNaN(channelNumber) && channelNumber >= 0 && channelNumber < videoLinks.length) {
      setCurrentIndex(channelNumber);
      loadVideo(videoLinks[channelNumber].src); // ✅ Load video on channel change
    } else {
      alert("Invalid channel number");
    }
  };

  return (
    <div className="search-navbar">
      {/* Left Logo */}
      <div className="search-navbar__left">
        <a href="/">
          <img src={Logo} alt="Dain Bramage TV" className="search-navbar__logo" />
        </a>
      </div>

      {/* Center Controls */}
      <div className="search-navbar__center">
        <button className="channel-button" onClick={goToPreviousVideo}>
          Ch-
        </button>

        <div className="search-navbar__channel-input-container">
          <input
            type="text"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            placeholder={`Ch: ${currentIndex}`}
            className="channel-input"
            onKeyDown={(e) => e.key === "Enter" && goToChannel()}
          />
          <button className="channel-go-button" onClick={goToChannel}>
            Go
          </button>
        </div>

        <button className="channel-button" onClick={goToNextVideo}>
          Ch+
        </button>

        {/* Mute Button */}
        <button className="mute-button" onClick={toggleMute}>
          <FaVolumeMute size={20} />
        </button>

        {/* Fullscreen Button */}
        <button className="fullscreen-button" onClick={toggleFullscreen}>
          <FaExpand size={20} />
        </button>
      </div>

      {/* Right Links & Profile/Login */}
      <div className="search-navbar__links">
        <a href="#" className="search-navbar__link" onClick={() => setIsGuideOpen?.((prev) => !prev)}>
          <img src={TvGuideIcon} alt="TV Guide" />
        </a>

        {/* ✅ Update Login Button to Open Auth Modal Instead */}
        {!isLoggedIn ? (
          <>
            <button onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }} className="search-navbar__login-button">
              Login
            </button>
          </>
        ) : (
          // Show Profile icon if logged in
          <div className="search-navbar__profile" onClick={() => setShowDropdown(!showDropdown)}>
            <FaUserCircle className="search-navbar__profile-icon" size={24} />
            {showDropdown && (
              <div className="profile-dropdown">
                <Link to="/profile" className="profile-dropdown__item">Profile</Link>
                <Link to="/settings" className="profile-dropdown__item">Settings</Link>
                <Link to="/upload" className="profile-dropdown__item">Upload</Link>
                <button onClick={handleLogout} className="profile-dropdown__logout">Log out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchNavBar;

