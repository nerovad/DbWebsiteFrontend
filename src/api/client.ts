// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
// ^ adjust if your backend runs elsewhere

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // if you use cookies/sessions
    ...options,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export const api = {
  // Channels
  createChannel: (body: any) =>
    request("/channels", { method: "POST", body: JSON.stringify(body) }),
  listChannels: () => request("/channels"),

  // Festivals / Sessions
  createSession: (body: any) =>
    request("/sessions", { method: "POST", body: JSON.stringify(body) }),
  startSession: (id: number) =>
    request(`/sessions/${id}/start`, { method: "POST" }),
  closeSession: (id: number) =>
    request(`/sessions/${id}/close`, { method: "POST" }),
  leaderboard: (id: number) => request(`/sessions/${id}/leaderboard`),

  // Lineups
  lineup: (sessionId: number) =>
    request(`/sessions/${sessionId}/lineup`),
  addEntry: (sessionId: number, body: any) =>
    request(`/sessions/${sessionId}/lineup`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
