import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.scss";
import Chatbox from "../Chatbox/Chatbox";
import "../../styles/_variables.scss";
import muteIcon from "../../assets/Mute.svg";
import { useChatStore } from "../../store/useChatStore";

interface VideoPlayerProps {
  isMenuOpen: boolean;
  isChatOpen: boolean;
  setVideoControls: (controls: {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    videoLinks: { src: string; channel: string }[];
    videoRef: React.RefObject<HTMLVideoElement>;
    goToNextVideo: () => void;
    goToPreviousVideo: () => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    loadVideo: (src: string) => void;
  }) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMenuOpen, isChatOpen, setVideoControls }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstance = useRef<Hls | null>(null);
  const { channelId, setChannelId } = useChatStore(); // Zustand state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [channelName, setChannelName] = useState("");
  const [isMuted, setIsMuted] = useState(true); // Video starts muted
  const [showMuteIcon, setShowMuteIcon] = useState(false);

  const toggleMute = () => {
    if (videoRef.current) {
      const muted = !videoRef.current.muted;
      videoRef.current.muted = muted;
      setIsMuted(muted);
      setShowMuteIcon(true);

      if (!muted) {
        // If unmuted, hide the icon immediately
        setTimeout(() => setShowMuteIcon(false), 200);
      }
    }
  };

  // ✅ Show mute icon on first load if muted
  useEffect(() => {
    if (videoRef.current?.muted) {
      setShowMuteIcon(true);
      setTimeout(() => setShowMuteIcon(false), 1500); // Hide after 1.5s
    }
  }, []);

  // ✅ Video Sources
  const videoLinks = [
    { src: "/videos/Color_Bars_DB_Web.mp4", channel: "channel-0" },
    { src: "https://dainbramage.tv:8088/channel2/channel2.m3u8", channel: "channel-1" },
    { src: "https://dainbramage.tv:8088/channel17/channel17.m3u8", channel: "channel-2" },
    { src: "https://dainbramage.tv:8088/channel29/channel29.m3u8", channel: "channel-3" },
    { src: "https://dainbramage.tv:8088/channel31/channel31.m3u8", channel: "channel-4" },
    { src: "https://dainbramage.tv:8088/channel99/channel99.m3u8", channel: "channel-99" }
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
    console.log(`Loading video: ${src}`); // ✅ Debugging log
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
        videoElement.play().catch(() => console.error("AutoPlay failed!"));
      });
      hlsInstance.current = hls;
    } else if (src.endsWith(".mp4")) {
      console.log("MP4 file detected, using native player");
      videoElement.src = src;
      videoElement.load();
      videoElement.play().catch(() => console.error("AutoPlay failed!"));
    } else {
      console.error("Invalid video format: ", src);
    }
  };

  const goToPreviousVideo = () => {
    const prevIndex = (currentIndex - 1 + videoLinks.length) % videoLinks.length;
    setCurrentIndex(prevIndex);
    loadVideo(videoLinks[prevIndex].src);
    setChannelName(videoLinks[prevIndex].channel);

    // Update chat room ID
    const newChannelId = `channel-${prevIndex}`;
    setChannelId(newChannelId);
    setTimeout(() => setChannelName(""), 7000);
  };


  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => console.error("Fullscreen failed:", err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  const goToNextVideo = () => {
    console.log("goToNextVideo() triggered!"); // Debugging
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

  // ✅ Send Video Controls to App.tsx

  useEffect(() => {
    if (typeof setVideoControls === "function") {
      setVideoControls({
        currentIndex,
        setCurrentIndex,
        videoLinks,
        videoRef,
        goToNextVideo,
        goToPreviousVideo,
        toggleMute,
        toggleFullscreen,
        loadVideo,
      });
    } else {
      console.error("setVideoControls is not a function yet!");
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault(); // Disable default right-click menu
      goToPreviousVideo(); // Go to previous channel
    };

    document.addEventListener("contextmenu", handleRightClick);

    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, [currentIndex]); // Re-run when `currentIndex` changes


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;

      // Prevent shortcuts if typing in an input field
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.getAttribute("contenteditable") === "true")) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "m": // Mute/Unmute
          toggleMute();
          break;
        case "f": // Fullscreen
          toggleFullscreen();
          break;
        case "arrowdown": // Previous channel
          goToPreviousVideo();
          break;
        case "arrowup": // Next channel
          goToNextVideo();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
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

      {showMuteIcon && (
        <img src={muteIcon} alt="Muted" className="mute-icon-overlay" />

      )}
    </div>
  );
};

export default VideoPlayer;
