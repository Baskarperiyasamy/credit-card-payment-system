import { createContext, useContext, useState } from "react";
import { api, tokens } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  async function login(username, password) {
    const data = await api.login({ username, password });
    tokens.set(data);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // token may already be expired; local sign-out still proceeds
    }
    tokens.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
