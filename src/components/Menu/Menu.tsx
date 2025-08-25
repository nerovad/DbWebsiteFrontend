import React, { useMemo, useState, useEffect, useCallback } from "react";
import "./Menu.scss";
import LeftArrowIcon from "../../assets/Left_Arrow.svg";
import { useChatStore } from "../../store/useChatStore";

/* === PROPS === */
interface UtilitiesProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/* === TYPES === */
type ModalKind = null | "ballot" | "battle" | "bracket" | "leaderboard";

type Film = {
  id: string;
  title: string;
  creator?: string;
  thumbnail?: string;
  duration?: string;
  synopsis?: string;
};

type BallotSubmit = {
  filmId: string;
  score: number; // 1..10
  tags: string[];
  comment?: string;
};

/* === REUSABLE MODAL (unchanged) === */
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}> = ({ isOpen, onClose, title, children, width = 560 }) => {
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [isOpen, onKey]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title || "Dialog"}>
      <div className="modal-card" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{title}</h4>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

/* === BALLOT WIDGET (unchanged UI) === */
const TAGS = ["Cinematography", "Story", "Originality", "Sound", "Editing"];

const StarRow: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  return (
    <div className="star-row" role="radiogroup" aria-label="Star rating 1 to 10">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            className={`star ${filled ? "filled" : ""}`}
            role="radio"
            aria-checked={n === value}
            onClick={() => onChange(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(10, value + 1));
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(1, value - 1));
            }}
            title={`${n} / 10`}
          >
            ★
          </button>
        );
      })}
      <span className="score-badge">{value}</span>
    </div>
  );
};

const VotingBallot: React.FC<{
  film: Film | null;
  onSubmit: (payload: BallotSubmit) => void;
  onSkip: () => void;
}> = ({ film, onSubmit, onSkip }) => {
  const [score, setScore] = useState<number>(8);
  const [useStars, setUseStars] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = () => {
    if (!film) return;
    onSubmit({
      filmId: film.id,
      score,
      tags,
      comment: comment.trim() || undefined,
    });
  };

  if (!film) {
    return <p>No films available for this channel yet.</p>;
  }

  return (
    <div className="ballot-card">
      <div className="ballot-header">
        {film.thumbnail && <img className="ballot-thumb" src={film.thumbnail} alt="" />}
        <div className="ballot-meta">
          <h4 className="ballot-title">{film.title}</h4>
          <p className="ballot-byline">
            {film.creator ? `by ${film.creator}` : null} {film.duration ? `• ${film.duration}` : null}
          </p>
          {film.synopsis && <p className="ballot-synopsis">{film.synopsis}</p>}
        </div>
      </div>

      <div className="ballot-controls">
        <div className="ballot-score">
          <div className="ballot-score__top">
            <span className="label">Score</span>
            <button
              className="linklike"
              onClick={() => setUseStars((v) => !v)}
              aria-label="Toggle score input type"
              title="Toggle between stars and slider"
            >
              {useStars ? "Use slider" : "Use stars"}
            </button>
          </div>

          {useStars ? (
            <StarRow value={score} onChange={setScore} />
          ) : (
            <div className="slider-row">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value, 10))}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowRight") setScore((s) => Math.min(10, s + 1));
                  if (e.key === "ArrowDown" || e.key === "ArrowLeft") setScore((s) => Math.max(1, s - 1));
                  if (e.key === "Enter") submit();
                }}
                aria-label="Score slider"
              />
              <span className="score-badge">{score}</span>
            </div>
          )}
        </div>

        <div className="ballot-tags">
          <span className="label">What stood out?</span>
          <div className="tag-row">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`tag-chip ${tags.includes(t) ? "selected" : ""}`}
                aria-pressed={tags.includes(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="ballot-notes">
          <span className="label">Notes (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a brief note for the filmmaker."
            rows={4}
          />
        </label>
      </div>

      <div className="ballot-actions">
        <button className="btn-secondary" onClick={onSkip}>Skip</button>
        <button className="btn-primary" onClick={submit}>Submit Vote</button>
      </div>
    </div>
  );
};

const Utilities: React.FC<UtilitiesProps> = ({ isOpen, setIsOpen }) => {
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const toggleMenu = () => setIsOpen(!isOpen);

  // get current channel from store (VideoPlayer sets it)
  const { channelId } = useChatStore(); // assumes store has { channelId }
  const [films, setFilms] = useState<Film[]>([]);
  const [idx, setIdx] = useState(0);

  // fetch films whenever channel changes
  useEffect(() => {
    let on = true;
    (async () => {
      if (!channelId) { setFilms([]); return; }
      try {
        const res = await fetch(`/api/channels/${encodeURIComponent(channelId)}/films`);
        if (!res.ok) throw new Error("Failed to load films");
        const data = await res.json();
        if (on) {
          // normalize keys to Film
          const mapped: Film[] = (data || []).map((f: any) => ({
            id: String(f.id),
            title: f.title,
            creator: f.creator ?? undefined,
            thumbnail: f.thumbnail ?? undefined,
            duration: f.duration ?? undefined,
            synopsis: f.synopsis ?? undefined,
          }));
          setFilms(mapped);
          setIdx(0);
        }
      } catch (e) {
        console.error(e);
        if (on) { setFilms([]); setIdx(0); }
      }
    })();
    return () => { on = false; };
  }, [channelId]);

  const currentFilm: Film | null = films.length ? films[idx % films.length] : null;

  const utilities = [
    { key: "ballot" as const, name: "Voting Ballot", description: "Rate and support your favorite entries." },
    { key: "battle" as const, name: "Battle Royale", description: "Films go head-to-head. You decide the winner." },
    { key: "bracket" as const, name: "Tournament Bracket", description: "See who’s advancing in the competition." },
    { key: "leaderboard" as const, name: "All Time Leaderboard", description: "Top-ranked filmmakers." },
  ];

  const submitVote = async (payload: BallotSubmit) => {
    if (!channelId) return;
    // ratings path (battle mode can use a different endpoint later)
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: channelId,         // slug or key
          film_id: payload.filmId,    // PK from films
          score: payload.score,       // 1..10
          tags: payload.tags,         // string[]
          comment: payload.comment,   // string | undefined
        }),
      });
    } catch (e) {
      console.error("vote failed", e);
    }
  };

  return (
    <>
      {/* === SIDEBAR === */}
      <div className={`utilities-container ${isOpen ? "open" : ""}`}>
        <button className={`toggle-button-left ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
          <img src={LeftArrowIcon} alt="Toggle" />
        </button>

        <div className={`utilities-menu ${isOpen ? "open" : ""}`}>
          <h3>The Pit</h3>
          <ul>
            {utilities.map((u) => (
              <li
                key={u.key}
                onClick={() => setActiveModal(u.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveModal(u.key)}
              >
                <strong>{u.name}</strong>
                <p>{u.description}</p>
              </li>
            ))}
          </ul>
          {/* Optional quick nav between films when ballot open */}
          {activeModal === "ballot" && films.length > 1 && (
            <div className="film-stepper">
              <button onClick={() => setIdx((i) => (i - 1 + films.length) % films.length)}>Prev Film</button>
              <span>{films.length ? `${(idx % films.length) + 1} / ${films.length}` : "0 / 0"}</span>
              <button onClick={() => setIdx((i) => (i + 1) % films.length)}>Next Film</button>
            </div>
          )}
        </div>
      </div>

      {/* === MODALS === */}
      <Modal
        isOpen={activeModal === "ballot"}
        onClose={() => setActiveModal(null)}
        title={channelId ? `Voting Ballot • ${channelId}` : "Voting Ballot"}
        width={620}
      >
        <VotingBallot
          film={currentFilm}
          onSubmit={async (payload) => {
            await submitVote(payload);
            // rotate to next film after vote
            setIdx((i) => (i + 1) % Math.max(1, films.length));
            setActiveModal(null);
          }}
          onSkip={() => {
            setIdx((i) => (i + 1) % Math.max(1, films.length));
            setActiveModal(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={activeModal === "battle"}
        onClose={() => setActiveModal(null)}
        title="Battle Royale"
        width={720}
      >
        <p>Coming soon: pick the winner between two head-to-head films.</p>
      </Modal>

      <Modal
        isOpen={activeModal === "bracket"}
        onClose={() => setActiveModal(null)}
        title="Tournament Bracket"
        width={880}
      >
        <p>Coming soon: live bracket view and rounds.</p>
      </Modal>

      <Modal
        isOpen={activeModal === "leaderboard"}
        onClose={() => setActiveModal(null)}
        title="All Time Leaderboard"
        width={720}
      >
        <p>Coming soon: the top-ranked filmmakers of all time.</p>
      </Modal>
    </>
  );
};

export default Utilities;
