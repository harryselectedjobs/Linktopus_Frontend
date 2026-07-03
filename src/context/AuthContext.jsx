import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const ACCESS_KEY = "linktopus_access_token";
const REFRESH_KEY = "linktopus_refresh_token";
const EMAIL_KEY = "linktopus_user_email";

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY));

  const login = useCallback(async (loginEmail, password) => {
    const { data } = await api.post("/auth/login", {
      email: loginEmail,
      password,
    });
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(EMAIL_KEY, loginEmail);
    setEmail(loginEmail);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setEmail(null);
  }, []);

  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_KEY));

  return (
    <AuthContext.Provider value={{ email, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
