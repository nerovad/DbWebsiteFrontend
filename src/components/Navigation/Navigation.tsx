import React from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import HomeIcon from "../../assets/DBwebsiteIconDBTV.svg";
import RemoteIcon from "../../assets/DB_Remote.svg";
import TvGuideIcon from "../../assets/DBwebsiteIconOpenSource.svg";
import "./Navigation.scss";

const SearchNavBar: React.FC = () => {
  return (
    <div className="search-navbar">
      <div className="search-navbar__search">
        <FaSearch className="search-navbar__icon" size={24} />
        <input type="text" placeholder="Search" className="search-navbar__input" />
      </div>
      <div className="search-navbar__links">
        <a href="/" className="search-navbar__link">
          <img src={HomeIcon} alt="Home" />
        </a>
        <a href="/" className="search-navbar__link">
          <img src={RemoteIcon} alt="Remote" />
        </a>
        <a href="/" className="search-navbar__link">
          <img src={TvGuideIcon} alt="TV Guide" />
        </a>
        <FaUserCircle className="search-navbar__profile-icon" size={24} />
      </div>
    </div>
  );
};

export default SearchNavBar;
