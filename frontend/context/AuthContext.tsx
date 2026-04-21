"use client";

import { createContext, useState, ReactNode, useContext } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  age?: number;
  role?: "user" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  login: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (data: { token: string; user: AuthUser }) => {
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
