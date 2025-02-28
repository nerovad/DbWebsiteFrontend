import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import Logo from "../../assets/J0013_DAIN_BRAMAGE_LOGO_V01.svg";
import HomeIcon from "../../assets/DBwebsiteIconDBTV.svg";
import RemoteIcon from "../../assets/DB_Remote.svg";
import TvGuideIcon from "../../assets/DBwebsiteIconOpenSource.svg";
import "./Navigation.scss";

interface NavBarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRemoteOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}
const SearchNavBar: React.FC<NavBarProps> = ({ isLoggedIn, setIsLoggedIn, setIsRemoteOpen }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT
    setIsLoggedIn(false);
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="search-navbar">
      {/* Left Logo */}
      <div className="search-navbar__left">
        <a href="/">
          <img src={Logo} alt="Dain Bramage TV" className="search-navbar__logo" />
        </a>
      </div>

      {/* Center Search Bar */}
      <div className="search-navbar__center">
        <div className="search-navbar__search">
          <FaSearch className="search-navbar__icon" size={24} />
          <input type="text" placeholder="Search" className="search-navbar__input" />
        </div>
      </div>

      {/* Right Links & Profile/Login */}
      <div className="search-navbar__links">
        <a href="/" className="search-navbar__link">
          <img src={HomeIcon} alt="Home" />
        </a>

        <a href="#" className="search-navbar__link" onClick={() => setIsRemoteOpen(prev => !prev)}>
          <img src={RemoteIcon} alt="Remote" />
        </a>

        <a href="/" className="search-navbar__link">
          <img src={TvGuideIcon} alt="TV Guide" />
        </a>

        {/* Show Login button if NOT logged in */}
        {!isLoggedIn ? (
          <Link to="/login" className="search-navbar__login-button">
            Login
          </Link>
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

