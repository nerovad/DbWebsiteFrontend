// src/store/AuthContext.tsx - Fixed Version
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token by trying to fetch user profile
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // In your AuthContext.tsx, add debug logs to the verifyToken function:
  const verifyToken = async (token: string) => {
    console.log('AuthContext: Verifying token:', token); // Debug
    try {
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('AuthContext: Token verification response:', response.status); // Debug

      if (response.ok) {
        const profileData = await response.json();
        console.log('AuthContext: Profile data received:', profileData); // Debug
        setUser({
          id: parseInt(profileData.id),
          username: profileData.handle?.replace('@', '') || 'user',
          email: 'user@example.com'
        });
      } else {
        console.log('AuthContext: Token invalid, clearing storage'); // Debug
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('AuthContext: Token verification failed:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use your existing login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token: newToken } = data;

        setToken(newToken);
        localStorage.setItem('token', newToken);

        // Verify token and get user data
        await verifyToken(newToken);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      // Use your existing register endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        // After successful registration, log them in
        return await login(email, password);
      } else {
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!(token && user);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isLoading,
      isAuthenticated
    }
    }>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
