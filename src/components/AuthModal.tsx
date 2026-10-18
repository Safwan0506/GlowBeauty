import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { X, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: () => void;
}

function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const { login, register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '', first_name: '', last_name: '', email: '', phone: '', password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(loginData.username, loginData.password);
    if (result.success) {
      onClose();
      navigate(loginData.username.toUpperCase() === 'ADMIN' ? '/admin' : '/client');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await register(registerData);
    if (result.success) {
      onSwitchMode();
      setLoginData({ username: registerData.username, password: registerData.password });
    } else {
      setError(result.error || "Erreur lors de l'inscription");
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/8 dark:border-[#F5F0EB]/8 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 font-light text-sm";
  const inputClassNoPad = "w-full px-4 py-3.5 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/8 dark:border-[#F5F0EB]/8 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 font-light text-sm";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1512] rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B76E79] to-[#D4A574] px-8 py-7 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-light tracking-[0.2em] uppercase">Scensora</h2>
              <p className="text-white/70 text-sm font-light mt-1">
                {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
              </p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-light">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.username}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30" />
                  <input type="text" required value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} className={inputClass} placeholder={t.auth.username} />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.password}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30" />
                  <input type={showPassword ? 'text' : 'password'} required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full pl-12 pr-12 py-3.5 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/8 dark:border-[#F5F0EB]/8 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 font-light text-sm" placeholder={t.auth.password} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30 hover:text-[#1A1A1A]/60 dark:hover:text-[#F5F0EB]/60">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] text-xs tracking-[0.15em] uppercase font-medium rounded-full hover:bg-[#B76E79] dark:hover:bg-[#B76E79] dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t.auth.connecting : t.auth.loginBtn}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.firstName}</label>
                  <input type="text" required value={registerData.first_name} onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })} className={inputClassNoPad} placeholder={t.auth.firstName} />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.lastName}</label>
                  <input type="text" required value={registerData.last_name} onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })} className={inputClassNoPad} placeholder={t.auth.lastName} />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.username}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30" />
                  <input type="text" required value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} className={inputClass} placeholder={t.auth.username} />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30" />
                  <input type="email" required value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className={inputClass} placeholder="votre@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30" />
                  <input type="tel" required value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} className={inputClass} placeholder="+237 6XX XXX XXX" />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-2">{t.auth.password}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30" />
                  <input type={showPassword ? 'text' : 'password'} required value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="w-full pl-12 pr-12 py-3.5 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/8 dark:border-[#F5F0EB]/8 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 font-light text-sm" placeholder={t.auth.password} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30 hover:text-[#1A1A1A]/60 dark:hover:text-[#F5F0EB]/60">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] text-xs tracking-[0.15em] uppercase font-medium rounded-full hover:bg-[#B76E79] dark:hover:bg-[#B76E79] dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t.auth.registering : t.auth.registerBtn}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-[#1A1A1A]/50 dark:text-[#F5F0EB]/50 text-sm font-light">
              {mode === 'login' ? (
                <>{t.auth.noAccount}{' '}<button onClick={onSwitchMode} className="text-[#B76E79] font-medium hover:underline">{t.auth.registerBtn}</button></>
              ) : (
                <>{t.auth.hasAccount}{' '}<button onClick={onSwitchMode} className="text-[#B76E79] font-medium hover:underline">{t.auth.loginBtn}</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
