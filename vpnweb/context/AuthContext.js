'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persist auth state in localStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('vpn-auth');
      if (savedAuth) {
        setAuth(JSON.parse(savedAuth));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData) => {
    setAuth(userData);
    localStorage.setItem('vpn-auth', JSON.stringify(userData));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('vpn-auth');
  };

  const contextValue = {
    auth,
    setAuth: login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
