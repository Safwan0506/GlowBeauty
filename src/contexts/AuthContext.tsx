import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Client } from '../types/database';
import { getDemoClients } from '../lib/demo-store';

interface AuthContextType {
  user: Client | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'ADMIN';
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5'; // hash SHA-256 de 12345 pour la démo locale

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isSha256Hash(value?: string) {
  return !!value && /^[a-f0-9]{64}$/i.test(value);
}

async function verifyPassword(inputPassword: string, storedPassword: string) {
  if (isSha256Hash(storedPassword)) {
    return (await sha256(inputPassword)) === storedPassword;
  }
  // Compatibilité avec les anciens comptes créés avant l'amélioration.
  return inputPassword === storedPassword;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('glowbeauty_user');
    const storedIsAdmin = localStorage.getItem('glowbeauty_isAdmin');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('glowbeauty_user');
      }
    }

    if (storedIsAdmin === 'true') {
      setIsAdmin(true);
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      // Check for admin (case insensitive)
      if (username.toUpperCase() === ADMIN_USERNAME.toUpperCase() && (await sha256(password)) === ADMIN_PASSWORD_HASH) {
        setIsAdmin(true);
        setUser(null);
        localStorage.setItem('glowbeauty_isAdmin', 'true');
        localStorage.removeItem('glowbeauty_user');
        return { success: true };
      }

      // Check for client using admin API for reliable access
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-crud/clients`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      let clients: Client[] = [];
      if (response.ok) {
        const payload = await response.json();
        clients = payload?.data || [];
      } else {
        clients = getDemoClients();
      }

      const clientCandidates = clients.filter((c: Client) =>
        c.username.toLowerCase() === username.toLowerCase()
      );

      let client: Client | undefined;
      for (const candidate of clientCandidates) {
        if (await verifyPassword(password, candidate.password_hash)) {
          client = candidate;
          break;
        }
      }

      if (!client) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      setUser(client);
      setIsAdmin(false);
      localStorage.setItem('glowbeauty_user', JSON.stringify(client));
      localStorage.removeItem('glowbeauty_isAdmin');

      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);

      const clientCandidates = getDemoClients().filter((c) => c.username.toLowerCase() === username.toLowerCase());
      for (const candidate of clientCandidates) {
        if (await verifyPassword(password, candidate.password_hash)) {
          setUser(candidate);
          setIsAdmin(false);
          localStorage.setItem('glowbeauty_user', JSON.stringify(candidate));
          localStorage.removeItem('glowbeauty_isAdmin');
          return { success: true };
        }
      }

      return { success: false, error: 'Identifiants incorrects ou serveur indisponible' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      // Check if username exists
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('username', data.username)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Ce nom d\'utilisateur existe deja' };
      }

      // Check if email exists
      const { data: existingEmail } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (existingEmail) {
        return { success: false, error: 'Cet email est deja utilise' };
      }

      // Insert new client - RLS allows public insert
      const { error } = await supabase
        .from('clients')
        .insert([{
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          password_hash: await sha256(data.password)
        }]);

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Erreur lors de l\'inscription: ' + error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Registration exception:', err);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('glowbeauty_user');
    localStorage.removeItem('glowbeauty_isAdmin');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated: !!user || isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
