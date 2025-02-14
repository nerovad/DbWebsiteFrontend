import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.scss";
import "../../styles/_variables.scss";

const videoLinks = [
  { src: "videos/Color_Bars_DB_Web.mp4", channel: "" },
  { src: "https://dainbramage.tv:8088/channel2/channel2.m3u8", channel: "Channel 2: Dain Bramage" },
  { src: "https://dainbramage.tv:8088/channel17/channel17.m3u8", channel: "Channel 17: Music" },
  { src: "https://dainbramage.tv:8088/channel29/channel29.m3u8", channel: "Channel 29: Skateboarding" },
  { src: "https://dainbramage.tv:8088/channel31/channel31.m3u8", channel: "Channel 31: Horror" }
];

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [channelName, setChannelName] = useState("");

  const goToNextVideo = () => {
    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    if (videoRef.current) {
      videoRef.current.src = randomVideo.src;
      videoRef.current.play();
    }
    setChannelName(randomVideo.channel);
  };

  return (
    <div className="video-container-dboriginals">
      <div className="tv-container">
        <video className="myvideo" ref={videoRef} muted autoPlay preload="metadata" onEnded={goToNextVideo}></video>
        <div className="db-originals-next-button" onClick={goToNextVideo}>
          <div className="channelnumber">{channelName}</div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
