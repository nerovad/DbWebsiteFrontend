import React from "react";
import "./NewsTicker.scss";
import "../../styles/_variables.scss";

const NewsTicker: React.FC = () => {
  return (
    <div className="news-ticker">
      <div className="ticker">
        <p>
          Welcome to Dain Bramage TV
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Click anywhere on screen to navigate channels
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Press 'm' to mute/unmute
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Want your own channel? Submit your work to us for review.
        </p>
      </div>
    </div>
  );
};

export default NewsTicker;
