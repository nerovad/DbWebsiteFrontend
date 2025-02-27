import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.scss";
import Chatbox from "../Chatbox/Chatbox";
import "../../styles/_variables.scss";
import { useChatStore } from "../../store/useChatStore";

interface VideoPlayerProps {
  isMenuOpen: boolean;
  isChatOpen: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMenuOpen, isChatOpen }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstance = useRef<Hls | null>(null);
  const { channelId, setChannelId } = useChatStore(); // ✅ Zustand state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [channelName, setChannelName] = useState("");

  // ✅ Video Sources
  const videoLinks = [
    { src: "/videos/Color_Bars_DB_Web.mp4", channel: "channel-0" },
    { src: "https://dainbramage.tv:8088/channel2/channel2.m3u8", channel: "channel-1" },
    { src: "https://dainbramage.tv:8088/channel17/channel17.m3u8", channel: "channel-2" },
    { src: "https://dainbramage.tv:8088/channel29/channel29.m3u8", channel: "channel-3" },
    { src: "https://dainbramage.tv:8088/channel31/channel31.m3u8", channel: "channel-4" }
  ];


  const getClassNames = () => {
    let classNames = "";

    if (isMenuOpen) classNames += " expanded-left";
    if (isChatOpen) classNames += " expanded-right";
    if (isMenuOpen && isChatOpen) classNames = "expanded-both";

    return classNames.trim();
  };

  // ✅ Load Video Function
  const loadVideo = (src: string) => {
    console.log(` Loading video: ${src}`); // ✅ Debugging log
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Cleanup previous instance
    if (hlsInstance.current) {
      hlsInstance.current.destroy();
    }

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      console.log("HLS stream detected, using HLS.js");
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(() => console.error(" AutoPlay failed!"));
      });
      hlsInstance.current = hls;
    } else if (src.endsWith(".mp4")) {
      console.log("MP4 file detected, using native player");
      videoElement.src = src;
      videoElement.load();
      videoElement.play().catch(() => console.error(" AutoPlay failed!"));
    } else {
      console.error("Invalid video format: ", src);
    }
  };


  // ✅ Go to Next Video

  const goToNextVideo = () => {
    console.log("goToNextVideo() triggered!"); // ✅ Debugging
    const nextIndex = (currentIndex + 1) % videoLinks.length;
    setCurrentIndex(nextIndex);
    loadVideo(videoLinks[nextIndex].src);
    setChannelName(videoLinks[nextIndex].channel);

    // Generate a unique chat room ID for the new video
    const newChannelId = `channel-${nextIndex}`;
    console.log(`Updating channelId to: ${newChannelId}`);
    setChannelId(newChannelId);

    // Hide Channel Name after 7 seconds
    setTimeout(() => setChannelName(""), 7000);
  };

  useEffect(() => {
    console.log(`VideoPlayer confirmed channelId: ${channelId}`);
  }, [channelId]);

  useEffect(() => {
    loadVideo(videoLinks[currentIndex].src);
  }, [currentIndex]);


  return (
    <div className={`video-container-dboriginals ${getClassNames()}`}>
      <div className="tv-container">
        <video
          className="myvideo"
          ref={videoRef}
          muted
          autoPlay
          preload="metadata"
          onEnded={goToNextVideo}
          controls={false}
        ></video>

        {/*Click this to go to the next video */}
        <div className="db-originals-next-button" onClick={goToNextVideo}>
          <div className="channelnumber">{channelName}</div>
        </div>
      </div>

      <Chatbox isOpen={isChatOpen} setIsOpen={() => { }} />
    </div>
  );

};

export default VideoPlayer;

