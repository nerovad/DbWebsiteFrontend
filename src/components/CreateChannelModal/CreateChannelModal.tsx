import React, { useEffect, useRef, useState } from "react";
import "./CreateChannelModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  excludeClickId?: string;
}

type VotingMode = "ratings" | "battle";
type EventType = "film_festival";

type NewFilm = {
  title: string;
  creator?: string;
  duration?: string; // "07:42"
  thumbnail?: string; // URL
};

const emptyFilm: NewFilm = { title: "", creator: "", duration: "", thumbnail: "" };

const CreateChannelModal: React.FC<Props> = ({ isOpen, onClose, excludeClickId }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // base channel
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);

  // event/festival
  const [addEvent, setAddEvent] = useState(false);
  const [eventType] = useState<EventType>("film_festival"); // only one for now
  const [eventTitle, setEventTitle] = useState("");
  const [startsAt, setStartsAt] = useState<string>(""); // ISO datetime-local
  const [endsAt, setEndsAt] = useState<string>("");
  const [votingMode, setVotingMode] = useState<VotingMode>("ratings");
  const [requireLogin, setRequireLogin] = useState<boolean>(true);

  // films
  const [films, setFilms] = useState<NewFilm[]>([{ ...emptyFilm }]);

  // Close on outside click
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

  // ESC, lock scroll, focus first input
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const canSubmit = () => {
    if (!name.trim() || !displayName.trim()) return false;
    if (!addEvent) return true;
    // festival fields required when addEvent is true
    if (!eventTitle.trim()) return false;
    if (!startsAt || !endsAt) return false;
    if (new Date(startsAt) >= new Date(endsAt)) return false;
    // at least 1 valid film
    const validFilms = films.filter(f => f.title.trim().length > 0);
    return validFilms.length > 0;
  };

  const addFilmRow = () => setFilms(prev => [...prev, { ...emptyFilm }]);
  const removeFilmRow = (idx: number) => setFilms(prev => prev.filter((_, i) => i !== idx));
  const updateFilm = (idx: number, patch: Partial<NewFilm>) =>
    setFilms(prev => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const normalizeFilms = (): NewFilm[] => {
    return films
      .map(f => ({
        title: f.title.trim(),
        creator: f.creator?.trim() || undefined,
        duration: f.duration?.trim() || undefined,
        thumbnail: f.thumbnail?.trim() || undefined,
      }))
      .filter(f => f.title.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;

    setSubmitting(true);
    try {
      // Single atomic POST with nested event + films
      const body: any = {
        name,
        display_name: displayName,
        type: addEvent ? "festival" : "channel", // fits your existing channels table
      };

      if (addEvent) {
        body.event = {
          kind: eventType,              // "film_festival"
          title: eventTitle,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          voting_mode: votingMode,      // "ratings" | "battle"
          require_login: requireLogin,
        };
        body.films = normalizeFilms();   // [{title, creator?, duration?, thumbnail?}]
      }

      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setChannelInfo(data);
        setName("");
        setDisplayName("");
        setAddEvent(false);
        setEventTitle("");
        setStartsAt("");
        setEndsAt("");
        setVotingMode("ratings");
        setRequireLogin(true);
        setFilms([{ ...emptyFilm }]);
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

          {/* Add Event Toggle */}
          <button
            type="button"
            className={`toggle-btn ${addEvent ? "active" : ""}`}
            onClick={() => setAddEvent(!addEvent)}
          >
            {addEvent ? "✓ Event Added" : "+ Add Event"}
          </button>

          {addEvent && (
            <div className="festival-block">
              {/* Event Type (fixed) */}
              <div className="row">
                <label>Type</label>
                <select value={eventType} disabled>
                  <option value="film_festival">Film Festival</option>
                </select>
              </div>

              <div className="row">
                <label>Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. DBTV Summer Shorts 2025"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>

              <div className="row cols-2">
                <div>
                  <label>Starts</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Ends</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row cols-2">
                <div>
                  <label>Voting Mode</label>
                  <select value={votingMode} onChange={(e) => setVotingMode(e.target.value as VotingMode)}>
                    <option value="ratings">Ratings (1–10)</option>
                    <option value="battle">Battle (head‑to‑head)</option>
                  </select>
                </div>
                <label className="checkbox-row" style={{ alignSelf: "end" }}>
                  <input
                    type="checkbox"
                    checked={requireLogin}
                    onChange={(e) => setRequireLogin(e.target.checked)}
                  />
                  <span>Require login to vote</span>
                </label>
              </div>

              <div className="films-header">
                <h4>Films in this festival</h4>
                <button type="button" className="btn-secondary small" onClick={addFilmRow}>+ Add Film</button>
              </div>

              <div className="films-table">
                {films.map((f, idx) => (
                  <div key={idx} className="film-row">
                    <input
                      type="text"
                      placeholder="Title *"
                      value={f.title}
                      onChange={(e) => updateFilm(idx, { title: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Creator (optional)"
                      value={f.creator || ""}
                      onChange={(e) => updateFilm(idx, { creator: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 07:42)"
                      value={f.duration || ""}
                      onChange={(e) => updateFilm(idx, { duration: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="Thumbnail URL (optional)"
                      value={f.thumbnail || ""}
                      onChange={(e) => updateFilm(idx, { thumbnail: e.target.value })}
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Remove film"
                      onClick={() => removeFilmRow(idx)}
                      disabled={films.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting || !canSubmit()}>
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
