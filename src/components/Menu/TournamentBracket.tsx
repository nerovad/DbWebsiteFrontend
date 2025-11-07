import React, { useState, useEffect } from "react";
import "./TournamentBracket.scss";

interface TournamentBracketProps {
  channelId: string;
  onFilmClick: (filmId: string) => void;
}

export interface Film {
  id: string;
  title: string;
  creator?: string;
  thumbnail?: string;
}

export interface FilmSeed {
  filmId: string;
  seed: number;
  title: string;
  creator?: string;
  thumbnail?: string;
}

export interface Matchup {
  id: string;
  position: number;
  roundNumber: number;
  film1: FilmSeed | null;
  film2: FilmSeed | null;
  winner?: string; // film id
  votes1?: number;
  votes2?: number;
}

export interface Round {
  roundNumber: number;
  roundName: string;
  matchups: Matchup[];
}

export interface TournamentData {
  id: string;
  status: "upcoming" | "active" | "completed";
  currentRound: number;
  rounds: Round[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ channelId, onFilmClick }) => {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournament();
  }, [channelId]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/channels/${channelId}/tournament`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load tournament data");
      }

      const data = await response.json();
      setTournament(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tournament:", err);
      setError(err instanceof Error ? err.message : "Failed to load tournament");
    } finally {
      setLoading(false);
    }
  };

  const getRoundName = (roundNumber: number, totalRounds: number): string => {
    const roundsFromEnd = totalRounds - roundNumber;

    if (roundsFromEnd === 0) return "Finals";
    if (roundsFromEnd === 1) return "Semi-Finals";
    if (roundsFromEnd === 2) return "Quarter-Finals";

    return `Round ${roundNumber}`;
  };

  const getWinnerPercentage = (votes1: number = 0, votes2: number = 0): [number, number] => {
    const total = votes1 + votes2;
    if (total === 0) return [50, 50];

    return [
      Math.round((votes1 / total) * 100),
      Math.round((votes2 / total) * 100)
    ];
  };

  if (loading) {
    return (
      <div className="tournament-bracket">
        <div className="loading">Loading tournament bracket...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-bracket">
        <div className="error">
          <p>⚠️ {error}</p>
          <button onClick={fetchTournament}>Retry</button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="tournament-bracket">
        <div className="empty">No tournament data available</div>
      </div>
    );
  }

  return (
    <div className="tournament-bracket">
      <div className="bracket-header">
        <h2>🏆 Tournament Bracket</h2>
        <div className="tournament-status">
          <span className={`status-badge ${tournament.status}`}>
            {tournament.status}
          </span>
          {tournament.status === "active" && (
            <span className="current-round">
              Current: {getRoundName(tournament.currentRound, tournament.rounds.length)}
            </span>
          )}
        </div>
      </div>

      <div className="bracket-container">
        <div className="rounds">
          {tournament.rounds.map((round) => (
            <div key={round.roundNumber} className="round">
              <div className="round-header">
                <h3>{getRoundName(round.roundNumber, tournament.rounds.length)}</h3>
                <span className="round-count">{round.matchups.length} match{round.matchups.length !== 1 ? 'es' : ''}</span>
              </div>

              <div className="matchups">
                {round.matchups.map((matchup) => {
                  const [pct1, pct2] = getWinnerPercentage(matchup.votes1, matchup.votes2);
                  const isActive = tournament.status === "active" && round.roundNumber === tournament.currentRound;
                  const hasWinner = !!matchup.winner;

                  return (
                    <div
                      key={matchup.id}
                      className={`matchup ${isActive ? 'active' : ''} ${hasWinner ? 'completed' : ''}`}
                    >
                      <div className="matchup-number">Match {matchup.position + 1}</div>

                      {/* Film 1 */}
                      <div
                        className={`competitor ${matchup.winner === matchup.film1?.filmId ? 'winner' : ''} ${!matchup.film1 ? 'bye' : ''}`}
                        onClick={() => matchup.film1 && isActive && onFilmClick(matchup.film1.filmId)}
                        style={{ cursor: matchup.film1 && isActive ? 'pointer' : 'default' }}
                      >
                        {matchup.film1 ? (
                          <>
                            <div className="film-info">
                              <span className="seed">#{matchup.film1.seed}</span>
                              <div className="film-details">
                                <div className="film-title">{matchup.film1.title}</div>
                                {matchup.film1.creator && (
                                  <div className="film-creator">{matchup.film1.creator}</div>
                                )}
                              </div>
                            </div>
                            {isActive && matchup.votes1 !== undefined && (
                              <div className="votes">
                                <span className="vote-count">{matchup.votes1}</span>
                                <span className="vote-pct">{pct1}%</span>
                              </div>
                            )}
                            {hasWinner && matchup.winner === matchup.film1.filmId && (
                              <div className="winner-badge">✓</div>
                            )}
                          </>
                        ) : (
                          <div className="bye-text">BYE</div>
                        )}
                      </div>

                      <div className="vs-divider">
                        <span>vs</span>
                        {isActive && (matchup.votes1 !== undefined || matchup.votes2 !== undefined) && (
                          <div className="vote-bar">
                            <div
                              className="vote-fill film1"
                              style={{ width: `${pct1}%` }}
                            />
                            <div
                              className="vote-fill film2"
                              style={{ width: `${pct2}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Film 2 */}
                      <div
                        className={`competitor ${matchup.winner === matchup.film2?.filmId ? 'winner' : ''} ${!matchup.film2 ? 'bye' : ''}`}
                        onClick={() => matchup.film2 && isActive && onFilmClick(matchup.film2.filmId)}
                        style={{ cursor: matchup.film2 && isActive ? 'pointer' : 'default' }}
                      >
                        {matchup.film2 ? (
                          <>
                            <div className="film-info">
                              <span className="seed">#{matchup.film2.seed}</span>
                              <div className="film-details">
                                <div className="film-title">{matchup.film2.title}</div>
                                {matchup.film2.creator && (
                                  <div className="film-creator">{matchup.film2.creator}</div>
                                )}
                              </div>
                            </div>
                            {isActive && matchup.votes2 !== undefined && (
                              <div className="votes">
                                <span className="vote-count">{matchup.votes2}</span>
                                <span className="vote-pct">{pct2}%</span>
                              </div>
                            )}
                            {hasWinner && matchup.winner === matchup.film2.filmId && (
                              <div className="winner-badge">✓</div>
                            )}
                          </>
                        ) : (
                          <div className="bye-text">BYE</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {tournament.status === "completed" && tournament.rounds[tournament.rounds.length - 1].matchups[0].winner && (
        <div className="champion-banner">
          <div className="champion-content">
            <h2>🏆 Champion</h2>
            <div className="champion-film">
              {(() => {
                const finalMatchup = tournament.rounds[tournament.rounds.length - 1].matchups[0];
                const champion = finalMatchup.winner === finalMatchup.film1?.filmId
                  ? finalMatchup.film1
                  : finalMatchup.film2;

                return champion ? (
                  <>
                    <div className="champion-title">{champion.title}</div>
                    {champion.creator && <div className="champion-creator">by {champion.creator}</div>}
                  </>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
