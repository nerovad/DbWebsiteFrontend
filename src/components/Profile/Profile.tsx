import React, { useEffect, useMemo, useState } from "react";
import "./Profile.scss";
import CreateChannelModal from "../CreateChannelModal/CreateChannelModal";
import { useApi } from "../../utils/useApi";

// Try to import your chat store if available; fall back gracefully.
let useChatStore: any = null;
try {
  // @ts-ignore
  useChatStore = require("../../store/useChatStore").useChatStore;
} catch { /* optional */ }

type Channel = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isLive?: boolean;
  thumbnail?: string;
};

type Film = {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  synopsis?: string;
  url?: string;
  provider?: string;
};

type Award = {
  id: string;
  name: string;
  year?: number | string;
  work?: string;
  position?: number;
};

type Company = {
  id: string;
  name: string;
  role?: string;
  website?: string;
  position?: number;
};

type ProfileData = {
  id: string;
  handle: string;
  displayName: string;
  bannerUrl?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  socials?: { label: string; url: string }[];
  stats: {
    followers: number;
    following: number;
    films: number;
    awards: number;
  };
};

type TabKey = "overview" | "channels" | "films" | "awards" | "companies" | "settings";

const DEFAULT_PROFILE: ProfileData = {
  id: "me",
  handle: "@username",
  displayName: "@username",
  bannerUrl: "",
  avatarUrl: "",
  bio: "",
  location: "",
  website: "",
  socials: [],
  stats: { followers: 0, following: 0, films: 0, awards: 0 },
};

const Profile: React.FC = () => {
  const api = useApi();
  const [active, setActive] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);

  // Use your existing auth pattern
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  // Editable fields
  const [bioDraft, setBioDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Pull channels from your store if available
  const storeChannels = useMemo(() => {
    try {
      return useChatStore ? useChatStore.getState?.().channels ?? [] : [];
    } catch {
      return [];
    }
  }, []);

  // Listen for storage changes (like your App.tsx does)
  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  // Auth required check
  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <div className="auth-required">
          <h2>Please log in to view your profile</h2>
          <button onClick={() => window.location.href = '/'}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let mounted = true;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Load all profile data
        const [profileData, filmsData, awardsData, companiesData] = await Promise.all([
          api.get("/api/profile/me", DEFAULT_PROFILE),
          api.get("/api/films/mine", []),
          api.get("/api/awards/mine", []),
          api.get("/api/companies/mine", [])
        ]);

        if (mounted) {
          setProfile({ ...DEFAULT_PROFILE, ...profileData });
          setFilms(filmsData);
          setAwards(awardsData);
          setCompanies(companiesData);
          setBioDraft(profileData?.bio ?? "");
        }

        // Load channels (from store or API)
        if (storeChannels && storeChannels.length > 0) {
          if (mounted) setChannels(storeChannels);
        } else {
          const channelsData = await api.get("/api/channels/mine", []);
          if (mounted) setChannels(channelsData);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        if (error.message === 'Authentication expired') {
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (isLoggedIn) {
      loadProfileData();
    }

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]); // Simple dependency on login status

  const onSaveBio = async () => {
    setIsSaving(true);
    try {
      await api.post("/api/profile/bio", { bio: bioDraft });
      setProfile((prev) => ({ ...prev, bio: bioDraft }));
      setIsEditingBio(false); // Exit edit mode after saving
    } catch (error) {
      console.error('Failed to save bio:', error);
      if (error.message === 'Authentication expired') {
        setIsLoggedIn(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const statItems = [
    { label: "Channels", value: channels.length },
    { label: "Awards", value: profile.stats.awards || awards.length },
  ];

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-skeleton">
          <div className="skeleton banner" />
          <div className="skeleton row" />
          <div className="skeleton block" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="avatar-wrap">
            {profile.avatarUrl ? (
              <img className="avatar" src={profile.avatarUrl} alt="Avatar" />
            ) : (
              <div className="avatar placeholder">{profile.displayName?.[0] || "U"}</div>
            )}
            <button className="avatar-edit-btn" onClick={() => {/* Handle avatar edit */ }}>
              ✏️
            </button>
          </div>

          <div className="identity">
            <div className="handle">{profile.handle}</div>
            {(profile.location || profile.website) && (
              <div className="meta">
                {profile.location && <span className="chip">{profile.location}</span>}
                {profile.website && (
                  <a className="chip link" href={profile.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
        <div className="stats-row">
          {statItems.map((s) => (
            <div key={s.label} className="stat">
              <div className="value">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {[
          ["overview", "Overview"],
          ["channels", "Channels"],
          ["films", "Films"],
          ["awards", "Awards"],
          ["companies", "Companies"],
          ["settings", "Settings"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`tab ${active === key ? "active" : ""}`}
            onClick={() => setActive(key as TabKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content">
        {active === "overview" && (
          <section className="panel">
            <h2>About</h2>
            <div className="about-grid">
              <div className="about-left">
                <label className="field-label">Bio</label>
                {!isEditingBio ? (
                  // Read-only bio display
                  <div className="bio-display">
                    <div className="bio-text">
                      {profile.bio || "No bio yet. Click Edit to add one."}
                    </div>
                    <div className="row-actions">
                      <button className="btn primary" onClick={() => setIsEditingBio(true)}>
                        Edit Bio
                      </button>
                    </div>
                  </div>
                ) : (
                  // Edit mode
                  <>
                    <textarea
                      className="input textarea"
                      rows={6}
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                      placeholder="Tell the world who you are, your style, and what you're working on."
                    />
                    <div className="row-actions">
                      <button
                        className="btn ghost"
                        onClick={() => {
                          setBioDraft(profile.bio || "");
                          setIsEditingBio(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button className="btn primary" onClick={onSaveBio} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Bio"}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="about-right">
                {/* Social links section stays the same */}
              </div>
            </div>
          </section>
        )}

        {active === "channels" && (
          <section className="panel">
            <div className="panel-head">
              <h2>Your Channels</h2>
              <button
                className="btn primary"
                onClick={() => setIsCreateChannelOpen(true)}
              >
                Create Channel
              </button>
            </div>

            {channels.length === 0 ? (
              <p className="muted">You have no channels yet.</p>
            ) : (
              <div className="card-grid">
                {channels.map((ch) => (
                  <div className="card channel" key={ch.id}>
                    <div className="thumb">
                      {ch.thumbnail ? (
                        <img src={ch.thumbnail} alt={ch.name} />
                      ) : (
                        <div className="thumb-fallback">
                          <div className="channel-placeholder">
                            <span className="channel-icon">📺</span> {/* or use an icon */}
                          </div>
                        </div>
                      )}
                      {ch.isLive && <span className="live-pill">LIVE</span>}
                    </div>                    <div className="card-body">
                      <div className="card-title">{ch.name}</div>
                      {ch.description && <p className="card-desc">{ch.description}</p>}
                      <div className="card-actions">
                        <a
                          className="btn ghost"
                          href={ch.slug ? `/channel/${ch.slug}` : `/channel/${ch.id}`}
                        >
                          View
                        </a>
                        <button className="btn">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {active === "films" && (
          <section className="panel">
            <div className="panel-head">
              <h2>Your Films</h2>
              <button className="btn primary">Upload Film</button>
            </div>
            {films.length === 0 ? (
              <p className="muted">No films yet. Upload your first film!</p>
            ) : (
              <div className="card-grid">
                {films.map((f) => (
                  <div className="card film" key={f.id}>
                    <div className="thumb">
                      {f.thumbnail ? <img src={f.thumbnail} alt={f.title} /> : <div className="thumb-fallback" />}
                      {f.duration && <span className="duration">{f.duration}</span>}
                    </div>
                    <div className="card-body">
                      <div className="card-title">{f.title}</div>
                      {f.synopsis && <p className="card-desc">{f.synopsis}</p>}
                      {f.provider && <div className="card-meta">via {f.provider}</div>}
                      <div className="card-actions">
                        {f.url ? (
                          <a className="btn ghost" href={f.url} target="_blank" rel="noreferrer">View</a>
                        ) : (
                          <a className="btn ghost" href={`/film/${f.id}`}>View</a>
                        )}
                        <button className="btn">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {active === "awards" && (
          <section className="panel">
            <div className="panel-head">
              <h2>Awards</h2>
              <button className="btn">Add Award</button>
            </div>
            {awards.length === 0 ? (
              <p className="muted">No awards yet. Start submitting your films to win!</p>
            ) : (
              <ul className="list awards">
                {awards.map((a) => (
                  <li key={a.id} className="list-item">
                    <div className="award-name">{a.name}</div>
                    <div className="award-meta">
                      {a.work && <span className="chip">{a.work}</span>}
                      {a.year && <span className="chip">{a.year}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {active === "companies" && (
          <section className="panel">
            <div className="panel-head">
              <h2>Production Companies</h2>
              <button className="btn">Add Company</button>
            </div>
            {companies.length === 0 ? (
              <p className="muted">List your production companies here.</p>
            ) : (
              <ul className="list companies">
                {companies.map((c) => (
                  <li key={c.id} className="list-item">
                    <div className="company-name">{c.name}</div>
                    <div className="company-meta">
                      {c.role && <span className="chip">{c.role}</span>}
                      {c.website && (
                        <a className="chip link" href={c.website} target="_blank" rel="noreferrer">
                          Website
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {active === "settings" && (
          <section className="panel">
            <h2>Settings</h2>
            <div className="settings-grid">
              <div className="setting">
                <div className="setting-title">Privacy</div>
                <div className="setting-desc">Control who can see your profile details.</div>
                <div className="toggle-row">
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                  <span>Make profile discoverable</span>
                </div>
              </div>

              <div className="setting">
                <div className="setting-title">Email Notifications</div>
                <div className="setting-desc">New followers, comments, and festival updates.</div>
                <div className="toggle-row">
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider" />
                  </label>
                  <span>Send me updates</span>
                </div>
              </div>

              <div className="setting">
                <div className="setting-title">Two-Factor Auth</div>
                <div className="setting-desc">Keep your account secure.</div>
                <button className="btn">Configure</button>
              </div>
            </div>
          </section>
        )}
      </div>
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
    </div>
  );
};

export default Profile;
