import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.scss";
import "../../styles/_variables.scss";

interface VideoPlayerProps {
  isMenuOpen: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMenuOpen }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstance = useRef<Hls | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [channelName, setChannelName] = useState("");

  // Video Sources
  const videoLinks = [
    { src: "videos/Color_Bars_DB_Web.mp4", channel: "" },
    { src: "https://dainbramage.tv:8088/channel2/channel2.m3u8", channel: "Channel 2: Dain Bramage" },
    { src: "https://dainbramage.tv:8088/channel17/channel17.m3u8", channel: "Channel 17: Music" },
    { src: "https://dainbramage.tv:8088/channel29/channel29.m3u8", channel: "Channel 29: Skateboarding" },
    { src: "https://dainbramage.tv:8088/channel31/channel31.m3u8", channel: "Channel 31: Horror" }
  ];

  // Function to Load Video
  const loadVideo = (src: string) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Clean up previous HLS instance
    if (hlsInstance.current) {
      hlsInstance.current.destroy();
    }

    // Handle HLS Streams (.m3u8)
    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play();
      });
      hlsInstance.current = hls;
    }
    // For regular MP4 streams
    else {
      videoElement.src = src;
      videoElement.load();
      videoElement.play().catch(() => console.error("AutoPlay failed"));
    }
  };

  // Play Next Video
  const goToNextVideo = () => {
    const nextIndex = (currentIndex + 1) % videoLinks.length;
    setCurrentIndex(nextIndex);
    loadVideo(videoLinks[nextIndex].src);
    setChannelName(videoLinks[nextIndex].channel);

    // Hide Channel Name after 7 seconds
    setTimeout(() => setChannelName(""), 7000);
  };

  // Play Previous Video
  const goToPreviousVideo = () => {
    const prevIndex = (currentIndex - 1 + videoLinks.length) % videoLinks.length;
    setCurrentIndex(prevIndex);
    loadVideo(videoLinks[prevIndex].src);
    setChannelName(videoLinks[prevIndex].channel);

    // Hide Channel Name after 7 seconds
    setTimeout(() => setChannelName(""), 7000);
  };

  // Handle Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        goToNextVideo();
      } else if (e.key === "ArrowDown") {
        goToPreviousVideo();
      } else if (e.key === "m") {
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Play First Video on Load
  useEffect(() => {
    loadVideo(videoLinks[currentIndex].src);
  }, [currentIndex]);

  return (
    <div className={`video-container-dboriginals ${isMenuOpen ? "expanded" : ""}`}>
      <div className="tv-container">
        <video
          className="myvideo"
          ref={videoRef}
          muted
          autoPlay
          preload="metadata"
          onEnded={goToNextVideo}
          disablePictureInPicture
          controls={false}
        ></video>

        <div className="db-originals-next-button" onClick={goToNextVideo}>
          <div className="channelnumber">{channelName}</div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

