import { writable } from 'svelte/store';

export interface User {
  userID: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  exp?: number;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    login: async (email: string, password: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid credentials');
        }
        const { user, token } = await response.json();
        console.log('Login response:', { user, token });
        if (!user || !user.email || !user.username) {
          throw new Error('Invalid user data from server');
        }
        const userData: User = {
          userID: String(user.userID || user.id || 'unknown'),
          email: user.email,
          username: user.username || user.name || user.email.split('@')[0],
          role: user.role || 'user',
          avatar: user.avatar,
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          exp: user.exp
        };
        localStorage.setItem('token', token);
        localStorage.setItem('email', user.email);
        set(userData);
        return { success: true };
      } catch (err) {
        if (err instanceof Error) {
          return { success: false, error: err.message };
        }
        return { success: false, error: 'Login failed' };
      }
    },
    signup: async (email: string, password: string, username: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Signup failed');
        }
        const { user, token } = await response.json();
        console.log('Signup response:', { user, token });
        if (!user || !user.email || !user.username) {
          throw new Error('Invalid user data from server');
        }
        const userData: User = {
          userID: String(user.userID || user.id || 'unknown'),
          email: user.email,
          username: user.username || user.name || user.email.split('@')[0],
          role: user.role || 'user',
          avatar: user.avatar,
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          exp: user.exp
        };
        localStorage.setItem('token', token);
        localStorage.setItem('email', user.email);
        set(userData);
        return { success: true };
      } catch (err) {
        if (err instanceof Error) {
          return { success: false, error: err.message };
        }
        return { success: false, error: 'Signup failed' };
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      set(null);
    },
    updateProfile: (updates: Partial<User>) => {
      update((user) => (user ? { ...user, ...updates } : null));
    },
    checkAuth: async () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      if (!token || !email) {
        set(null);
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, password: '' }), 
        });
        if (response.ok) {
          const { user } = await response.json();
          console.log('CheckAuth response:', { user });
          if (!user || !user.email || !user.username) {
            throw new Error('Invalid user data from server');
          }
          const userData: User = {
            userID: String(user.userID || user.id || 'unknown'),
            email: user.email,
            username: user.username || user.name || user.email.split('@')[0],
            role: user.role || 'user',
            avatar: user.avatar,
            createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
            exp: user.exp
          };
          set(userData);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          set(null);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        set(null);
      }
    },
  };
}

export const auth = createAuthStore();