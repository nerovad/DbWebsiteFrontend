import React, { useEffect, useMemo, useState } from "react";
import "./Profile.scss";

// Try to import your chat store if available; fall back gracefully.
let useChatStore: any = null;
try {
  // If you don’t have this in the project, this try/catch keeps things safe.
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
};

type Award = {
  id: string;
  name: string;
  year?: number | string;
  work?: string; // film or project the award was for
};

type Company = {
  id: string;
  name: string;
  role?: string;
  website?: string;
};

type BusinessCard = {
  fullName: string;
  role: string;
  email: string;
  phone?: string;
  website?: string;
  company?: string;
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

type TabKey =
  | "overview"
  | "channels"
  | "films"
  | "awards"
  | "companies"
  | "business-card"
  | "settings";

const DEFAULT_PROFILE: ProfileData = {
  id: "me",
  handle: "@username",
  displayName: "Your Name",
  bannerUrl: "",
  avatarUrl: "",
  bio: "",
  location: "",
  website: "",
  socials: [],
  stats: { followers: 0, following: 0, films: 0, awards: 0 },
};

const Profile: React.FC = () => {
  const [active, setActive] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessCard, setBusinessCard] = useState<BusinessCard>({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    website: "",
    company: "",
  });

  // Editable fields
  const [bioDraft, setBioDraft] = useState("");
  const [businessDraft, setBusinessDraft] = useState<BusinessCard>(businessCard);
  const [isSaving, setIsSaving] = useState(false);

  // Pull channels from your store if available, else fetch.
  const storeChannels = useMemo(() => {
    try {
      return useChatStore ? useChatStore.getState?.().channels ?? [] : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        // Profile
        const p = await safeGet("/api/profile/me", DEFAULT_PROFILE);
        // If your API returns nulls, coerce into our shape
        if (mounted) setProfile({ ...DEFAULT_PROFILE, ...p });

        // Channels
        if (storeChannels && storeChannels.length > 0) {
          setChannels(storeChannels);
        } else {
          const c = await safeGet("/api/channels/mine", []);
          if (mounted) setChannels(c);
        }

        // Films
        const f = await safeGet("/api/films/mine", []);
        if (mounted) setFilms(f);

        // Awards
        const a = await safeGet("/api/awards/mine", []);
        if (mounted) setAwards(a);

        // Companies
        const co = await safeGet("/api/companies/mine", []);
        if (mounted) setCompanies(co);

        // Business card
        const bc = await safeGet("/api/profile/business-card", null);
        if (mounted && bc) {
          setBusinessCard(bc);
          setBusinessDraft(bc);
        }

        // Drafts
        if (mounted) setBioDraft(p?.bio ?? "");
      } catch {
        // Fail silently but present defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storeChannels]);

  const onSaveBio = async () => {
    setIsSaving(true);
    try {
      await safePost("/api/profile/bio", { bio: bioDraft });
      setProfile((prev) => ({ ...prev, bio: bioDraft }));
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveBusinessCard = async () => {
    setIsSaving(true);
    try {
      await safePost("/api/profile/business-card", businessDraft);
      setBusinessCard(businessDraft);
    } finally {
      setIsSaving(false);
    }
  };

  const statItems = [
    { label: "Followers", value: profile.stats.followers },
    { label: "Following", value: profile.stats.following },
    { label: "Films", value: profile.stats.films || films.length },
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
        <div
          className="profile-banner"
          style={{
            backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : "none",
          }}
        >
          {!profile.bannerUrl && <div className="banner-fallback" />}
        </div>

        <div className="profile-header-content">
          <div className="avatar-wrap">
            {profile.avatarUrl ? (
              <img className="avatar" src={profile.avatarUrl} alt="Avatar" />
            ) : (
              <div className="avatar placeholder">{profile.displayName?.[0] || "U"}</div>
            )}
          </div>

          <div className="identity">
            <h1 className="display-name">{profile.displayName}</h1>
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

          <div className="header-actions">
            <button className="btn ghost">Share</button>
            <button className="btn primary">Edit Profile</button>
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
          ["business-card", "Business Card"],
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
                <textarea
                  className="input textarea"
                  rows={6}
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Tell the world who you are, your style, and what you’re working on."
                />
                <div className="row-actions">
                  <button className="btn ghost" onClick={() => setBioDraft(profile.bio || "")}>
                    Reset
                  </button>
                  <button className="btn primary" onClick={onSaveBio} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Bio"}
                  </button>
                </div>
              </div>
              <div className="about-right">
                <label className="field-label">Social Links</label>
                <ul className="socials">
                  {(profile.socials?.length ? profile.socials : []).map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.label}
                      </a>
                    </li>
                  ))}
                  {!(profile.socials?.length ?? 0) && <li>No socials yet.</li>}
                </ul>
              </div>
            </div>
          </section>
        )}

        {active === "channels" && (
          <section className="panel">
            <div className="panel-head">
              <h2>Your Channels</h2>
              <button className="btn primary">Create Channel</button>
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
                        <div className="thumb-fallback" />
                      )}
                      {ch.isLive && <span className="live-pill">LIVE</span>}
                    </div>
                    <div className="card-body">
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
                      <div className="card-actions">
                        <a className="btn ghost" href={`/film/${f.id}`}>View</a>
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

        {active === "business-card" && (
          <section className="panel">
            <h2>Business Card</h2>
            <div className="biz-grid">
              <div className="biz-form">
                <div className="form-row">
                  <label className="field-label">Full Name</label>
                  <input
                    className="input"
                    value={businessDraft.fullName}
                    onChange={(e) => setBusinessDraft({ ...businessDraft, fullName: e.target.value })}
                    placeholder="Your Name"
                  />
                </div>
                <div className="form-row">
                  <label className="field-label">Role</label>
                  <input
                    className="input"
                    value={businessDraft.role}
                    onChange={(e) => setBusinessDraft({ ...businessDraft, role: e.target.value })}
                    placeholder="Director / Editor / Producer"
                  />
                </div>
                <div className="form-row two">
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      className="input"
                      value={businessDraft.email}
                      onChange={(e) => setBusinessDraft({ ...businessDraft, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="field-label">Phone</label>
                    <input
                      className="input"
                      value={businessDraft.phone}
                      onChange={(e) => setBusinessDraft({ ...businessDraft, phone: e.target.value })}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>
                <div className="form-row two">
                  <div>
                    <label className="field-label">Company</label>
                    <input
                      className="input"
                      value={businessDraft.company}
                      onChange={(e) => setBusinessDraft({ ...businessDraft, company: e.target.value })}
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="field-label">Website</label>
                    <input
                      className="input"
                      value={businessDraft.website}
                      onChange={(e) => setBusinessDraft({ ...businessDraft, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="row-actions">
                  <button
                    className="btn ghost"
                    onClick={() => setBusinessDraft(businessCard)}
                    disabled={isSaving}
                  >
                    Reset
                  </button>
                  <button className="btn primary" onClick={onSaveBusinessCard} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Card"}
                  </button>
                </div>
              </div>

              <div className="biz-preview">
                <div className="card biz">
                  <div className="biz-name">{businessDraft.fullName || "Your Name"}</div>
                  <div className="biz-role">{businessDraft.role || "Your Role"}</div>
                  <div className="biz-detail">{businessDraft.company || "Company"}</div>
                  {businessDraft.website && <div className="biz-detail">{businessDraft.website}</div>}
                  <div className="biz-detail">{businessDraft.email || "you@example.com"}</div>
                  {businessDraft.phone && <div className="biz-detail">{businessDraft.phone}</div>}
                </div>
              </div>
            </div>
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
    </div>
  );
};

async function safeGet<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function safePost<T extends object>(url: string, body: T) {
  try {
    await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    /* swallow for now */
  }
}

export default Profile;
