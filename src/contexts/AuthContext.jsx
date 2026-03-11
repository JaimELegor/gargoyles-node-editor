import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "gargoyles_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // { username, avatar }
  const [ready, setReady] = useState(false);
  

  const isAuthed = !!token;

  function saveAuth(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: nextToken, user: nextUser })
    );
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function loginWithGithub() {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`;
  }

  async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) logout();
    return res;
  }

  // 1) Load saved auth (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setToken(parsed.token || null);
        setUser(parsed.user || null);
      }
    } finally {
      setReady(true);
    }
  }, []);

  // 2) OAuth callback handling (exchange code version)
  // Backend redirects to: FRONTEND_URL?exchange=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search); 
    const exchange = params.get("exchange");
    if (!exchange) return;

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/exchange?exchange=${encodeURIComponent(exchange)}`
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Exchange failed:", data);
          return;
        }

        // Expecting: { token: "...", user: { username, avatar } }
        if (data?.token && data?.user) {
          saveAuth(data.token, data.user);
        } else {
          console.error("Exchange response missing token/user:", data);
        }
      } catch (e) {
        console.error("Exchange network error:", e);
      } finally {
        // Remove exchange from URL without reload
        params.delete("exchange"); 
        const nextUrl =
          `${window.location.pathname}` +
          `${params.toString() ? `?${params.toString()}` : ""}`;

        // replaceState modifies current history entry 
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({ ready, token, user, isAuthed, loginWithGithub, saveAuth, logout, apiFetch }),
    [ready, token, user, isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}