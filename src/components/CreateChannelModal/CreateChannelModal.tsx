import React, { useEffect, useRef, useState } from "react";
import "./CreateChannelModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  excludeClickId?: string; // optional element to ignore for outside-click (e.g., "remote-button")
}

const CreateChannelModal: React.FC<Props> = ({ isOpen, onClose, excludeClickId }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);

  // Close on outside click (TvGuide pattern)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const excludeEl = excludeClickId ? document.getElementById(excludeClickId) : null;
      if (
        boxRef.current &&
        !boxRef.current.contains(event.target as Node) &&
        (!excludeEl || !excludeEl.contains(event.target as Node))
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, excludeClickId]);

  // Close on ESC, lock background scroll, focus first input
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, display_name: displayName }),
      });

      if (res.ok) {
        const data = await res.json();
        setChannelInfo(data);
        setName("");
        setDisplayName("");
        setSuccess(true);
      } else {
        console.error("Failed to create channel");
      }
    } catch (err) {
      console.error("Error submitting channel", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-channel-overlay" role="dialog" aria-modal="true" aria-labelledby="create-channel-title">
      <div className="create-channel-content" ref={boxRef}>
        <button className="close-btn" onClick={onClose} aria-label="Close create channel">X</button>

        <h2 id="create-channel-title">Create Channel</h2>

        <form className="create-channel-form" onSubmit={handleSubmit}>
          <input
            ref={firstFieldRef}
            type="text"
            placeholder="Internal name (e.g. channel42)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Display name (e.g. Channel 42)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Channel"}
          </button>
        </form>

        {success && <p className="create-channel-message">✅ Channel created successfully!</p>}

        {channelInfo && (
          <div className="channel-details">
            <p><strong>Stream Key:</strong> {channelInfo.stream_key}</p>
            <p><strong>Ingest URL for OBS:</strong> rtmp://dainbramage.tv/live/{channelInfo.stream_key}</p>
            <p><strong>Playback URL (HLS):</strong> {channelInfo.playback_path}</p>

            <div className="channel-actions">
              <button onClick={() => navigator.clipboard.writeText(channelInfo.stream_key)}>
                Copy Stream Key
              </button>
              <button onClick={() => navigator.clipboard.writeText(`rtmp://dainbramage.tv/live/${channelInfo.stream_key}`)}>
                Copy Ingest URL
              </button>
              <button onClick={() => navigator.clipboard.writeText(channelInfo.playback_path)}>
                Copy Playback URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateChannelModal;
