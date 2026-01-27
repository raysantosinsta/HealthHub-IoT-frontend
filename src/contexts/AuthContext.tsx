"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

const COOKIE_NAME = "access_token";
const LOCAL_STORAGE_KEY = "token";

// 👇 1. ATUALIZE A INTERFACE AQUI
// Altere sua interface para incluir exatamente o que você precisa
interface UserPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyName?: string; // Nome da empresa para exibir no Header
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  user: UserPayload | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const parseJwt = (token: string): UserPayload | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null; // Proteção para SSR
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(";").shift() ?? null : null;
  };

  const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/;`;
  };

  const removeCookie = (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
  };

  // 🔎 Verificação inicial
  useEffect(() => {
    const storedToken = getCookie(COOKIE_NAME) || localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedToken) {
      const payload = parseJwt(storedToken);

      if (payload && (!payload.exp || payload.exp > Date.now() / 1000)) {
        setToken(storedToken);
        setUser(payload);
      } else {
        removeCookie(COOKIE_NAME);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    setCookie(COOKIE_NAME, newToken);
    localStorage.setItem(LOCAL_STORAGE_KEY, newToken);

    const payload = parseJwt(newToken);
    setToken(newToken);
    setUser(payload);
    setLoading(false); 
  };

  const logout = () => {
    removeCookie(COOKIE_NAME);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setToken(null);
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used dentro do AuthProvider");
  return context;
}