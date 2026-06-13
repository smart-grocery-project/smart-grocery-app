// ─────────────────────────────────────────────────────────────────────────────
// AuthContext.js  —  Stores user + token after login, persists across restarts
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sg_token';
const USER_KEY  = 'sg_user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — try to load a saved session from storage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser  = await AsyncStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setAuthToken(savedToken);
        }
      } catch (_) {
        // No session — that's fine
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setAuthToken(authToken);
    await AsyncStorage.setItem(TOKEN_KEY, authToken);
    await AsyncStorage.setItem(USER_KEY,  JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
