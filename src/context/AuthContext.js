// ─────────────────────────────────────────────────────────────────────────────
// AuthContext.js  —  Stores user + token after login, available app-wide
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState } from 'react';
import { setAuthToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);

  const signIn = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setAuthToken(authToken); // attach to all future API requests
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Easy hook to use auth anywhere: const { user, signIn, signOut } = useAuth();
export const useAuth = () => useContext(AuthContext);
