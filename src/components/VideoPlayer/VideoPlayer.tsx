import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import "./VideoPlayer.scss";
import Chatbox from "../Chatbox/Chatbox";
import "../../styles/_variables.scss";
import muteIcon from "../../assets/Mute.svg";
import { useChatStore } from "../../store/useChatStore";

interface VideoLink { src: string; channel: string; isLive?: boolean; }

interface VideoPlayerProps {
  isMenuOpen: boolean;
  isChatOpen: boolean;
  setVideoControls: (controls: {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    videoLinks: VideoLink[];
    videoRef: React.RefObject<HTMLVideoElement>;
    goToNextVideo: () => void;
    goToPreviousVideo: () => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    loadVideo: (src: string) => void;
  }) => void;
}

const HLS_BASE = "https://dainbramage.tv:8088"; // nested style: /hls/<key>/<key>.m3u8

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMenuOpen, isChatOpen, setVideoControls }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const endedListenerRef = useRef<(() => void) | null>(null);
  const switchingRef = useRef(false);     // debounce switches
  const retryRef = useRef(0);             // hls retry counter

  const { setChannelId } = useChatStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [channelName, setChannelName] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([
    // Always index 0 = local color bars fallback
    { src: "/videos/Color_Bars_DB_Web.mp4", channel: "channel-0", isLive: false },
  ]);

  // --- helpers ---
  const getClassNames = () => {
    let classNames = "";
    if (isMenuOpen) classNames += " expanded-left";
    if (isChatOpen) classNames += " expanded-right";
    if (isMenuOpen && isChatOpen) classNames = "expanded-both";
    return classNames.trim();
  };

  const cleanupHls = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      if (endedListenerRef.current) {
        v.removeEventListener("ended", endedListenerRef.current as any);
        endedListenerRef.current = null;
      }
      v.removeAttribute("src");
      v.load();
    }
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch { }
      hlsRef.current = null;
    }
    retryRef.current = 0;
  };

  const attachEndedForMp4 = () => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => goToNextVideo(); // only for VOD/mp4
    v.addEventListener("ended", onEnded);
    endedListenerRef.current = () => v.removeEventListener("ended", onEnded);
  };

  // --- loadVideo with robust HLS handling ---
  const loadVideo = useCallback((src: string) => {
    const v = videoRef.current;
    if (!v) return;

    cleanupHls();

    // MP4
    if (src.endsWith(".mp4")) {
      v.src = src;
      attachEndedForMp4();
      v.muted = true; // browsers require muted autoplay
      v.play().catch(() => { });
      return;
    }

    // HLS
    if (Hls.isSupported()) {
      const hls = new Hls({
        liveBackBufferLength: 0,
        backBufferLength: 0,
        maxBufferLength: 10,
        maxBufferSize: 60 * 1000 * 1000,
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(v);

      // Correct event names
      hls.on("manifestParsed", () => {
        v.muted = true;
        v.play().catch(() => { });
      });

      hls.on("error", (_evt: any, data: any) => {
        const fatal = !!data?.fatal;
        const type = data?.type as string | undefined; // 'networkError' | 'mediaError' | etc.
        if (!fatal) return;

        if (type === "networkError") {
          if (retryRef.current < 3) {
            retryRef.current += 1;
            (hls as any).startLoad?.();
          } else {
            goToNextVideo();
          }
        } else if (type === "mediaError") {
          try {
            (hls as any).recoverMediaError?.();
          } catch {
            goToNextVideo();
          }
        } else {
          goToNextVideo();
        }
      });

      return;
    }

    // Safari (native HLS)
    const vtag = videoRef.current;
    if (vtag?.canPlayType("application/vnd.apple.mpegurl")) {
      vtag.src = src;
      vtag.muted = true;
      vtag.play().catch(() => { });
      return;
    }

    console.error("This browser cannot play HLS.");
  }, []);

  // --- channel switchers (debounced) ---
  const switchToIndex = (idx: number) => {
    if (switchingRef.current) return;
    switchingRef.current = true;

    const safeIdx = ((idx % videoLinks.length) + videoLinks.length) % videoLinks.length;
    setCurrentIndex(safeIdx);

    const dest = videoLinks[safeIdx];
    setChannelName(dest.channel);
    loadVideo(dest.src);

    setChannelId(dest.channel);

    setTimeout(() => {
      switchingRef.current = false;
      setTimeout(() => setChannelName(""), 7000);
    }, 200);
  };

  const goToNextVideo = useCallback(() => switchToIndex(currentIndex + 1), [currentIndex, videoLinks.length]);
  const goToPreviousVideo = useCallback(() => switchToIndex(currentIndex - 1), [currentIndex, videoLinks.length]);

  // --- mute/fullscreen ---
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const muted = !v.muted;
    v.muted = muted;
    setIsMuted(muted);
    setShowMuteIcon(true);
    if (!muted) setTimeout(() => setShowMuteIcon(false), 200);
  };

  const toggleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!document.fullscreenElement) v.requestFullscreen().catch(() => { });
    else document.exitFullscreen().catch(() => { });
  };

  // --- first mount: show mute badge briefly ---
  useEffect(() => {
    const v = videoRef.current;
    if (v?.muted) {
      setShowMuteIcon(true);
      setTimeout(() => setShowMuteIcon(false), 1500);
    }
  }, []);

  // --- fetch channels dynamically (keeps your color bars at index 0) ---
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/channels");
        const channels = await res.json();

        // Build nested-style URLs: /hls/<key>/<key>.m3u8
        const dynamic: VideoLink[] = channels
          .map((ch: any) => {
            const key = ch.stream_key ?? ch.slug ?? ch.key;
            if (!key) return null;
            const src = `${HLS_BASE}/hls/${key}/index.m3u8`;
            return { src, channel: ch.slug ?? key, isLive: true };
          })
          .filter(Boolean) as VideoLink[];

        if (alive) {
          setVideoLinks(prev => [prev[0], ...dynamic]);
        }
      } catch (e) {
        console.error("Failed to fetch channels", e);
      }
    })();

    return () => { alive = false; };
  }, []);

  // --- load stream whenever currentIndex or list changes ---
  useEffect(() => {
    const link = videoLinks[currentIndex];
    if (!link) return;
    loadVideo(link.src);
    setChannelId(link.channel);
    setChannelName(link.channel);
    const hide = setTimeout(() => setChannelName(""), 7000);
    return () => clearTimeout(hide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, videoLinks]);

  // --- provide controls to NavBar (as before) ---
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, videoLinks]);

  // --- keyboard shortcuts + right-click prev (cleanly mounted once) ---
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.getAttribute("contenteditable") === "true")) return;
      switch (event.key.toLowerCase()) {
        case "m": toggleMute(); break;
        case "f": toggleFullscreen(); break;
        case "arrowdown": goToPreviousVideo(); break;
        case "arrowup": goToNextVideo(); break;
      }
    };
    const handleRightClick = (e: MouseEvent) => { e.preventDefault(); goToPreviousVideo(); };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("contextmenu", handleRightClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("contextmenu", handleRightClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToNextVideo, goToPreviousVideo]);

  // --- unmount cleanup ---
  useEffect(() => () => cleanupHls(), []);

  return (
    <div className={`video-container-dboriginals ${getClassNames()}`}>
      <div className="tv-container">
        <video
          className="myvideo"
          ref={videoRef}
          muted
          autoPlay
          preload="metadata"
          playsInline
          controls={false}
        />
        <div className="db-originals-next-button" onClick={goToNextVideo}>
          <div className="channelnumber">{channelName}</div>
        </div>
      </div>

      <Chatbox isOpen={isChatOpen} setIsOpen={() => { }} />

      {showMuteIcon && <img src={muteIcon} alt="Muted" className="mute-icon-overlay" />}
    </div>
  );
};

export default VideoPlayer;
