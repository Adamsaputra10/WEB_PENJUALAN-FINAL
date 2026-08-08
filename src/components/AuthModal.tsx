import React, { useState, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../lib/translations';
import { soundFx } from '../lib/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        soundFx.playClose();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-bounce">
        <div className="retro-window bg-[#1d1e30] border-2 border-[#ff7700] shadow-lg p-2.5 flex items-center gap-3">
          <span className="font-pixel text-xs text-[#ff7700] font-bold uppercase">
            {mode === 'LOGIN' ? t('loginTitle') : t('registerTitle')}
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              setIsMinimized(false);
            }}
            className="retro-btn bg-[#00a68d] text-black px-2 py-1 text-xs font-bold cursor-pointer"
            title="Expand Window"
          >
            [ + ] EXPAND
          </button>
          <button
            onClick={() => {
              soundFx.playClose();
              setIsMinimized(false);
              onClose();
            }}
            className="retro-btn bg-[#ff7700] text-black px-2 py-1 text-xs font-bold cursor-pointer"
            title="Close Window"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSwitchMode = (newMode: 'LOGIN' | 'REGISTER') => {
    soundFx.playClick();
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'LOGIN') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage(t('fillAllFields'));
        soundFx.playError();
        return;
      }

      // Simulate successful login
      const loggedUser: UserProfile = {
        name: email.split('@')[0].toUpperCase() || 'USER_90S',
        email: email.trim(),
        joinDate: new Date().toISOString().split('T')[0]
      };

      setSuccessMessage(t('loginSuccessMsg'));
      soundFx.playSuccess();

      setTimeout(() => {
        onLoginSuccess(loggedUser);
        resetForm();
        onClose();
      }, 600);
    } else {
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setErrorMessage(t('fillAllFields'));
        soundFx.playError();
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage(t('passwordMismatch'));
        soundFx.playError();
        return;
      }

      const newUser: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        joinDate: new Date().toISOString().split('T')[0]
      };

      setSuccessMessage(t('registerSuccessMsg'));
      soundFx.playSuccess();

      setTimeout(() => {
        onLoginSuccess(newUser);
        resetForm();
        onClose();
      }, 600);
    }
  };

  const handleDemoLogin = () => {
    soundFx.playClick();
    const demoUser: UserProfile = {
      name: 'Ilyasiel Customer',
      email: 'customer@retroshop.net',
      joinDate: '1995-10-24'
    };
    setSuccessMessage(t('loginSuccessMsg'));
    soundFx.playSuccess();

    setTimeout(() => {
      onLoginSuccess(demoUser);
      resetForm();
      onClose();
    }, 500);
  };

  return (
    <div 
      onClick={() => {
        soundFx.playClose();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1d1e30] border-4 border-[#ff7700] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-fade-in overflow-hidden cursor-default"
      >
        {/* Retro Window Titlebar */}
        <div className="bg-[#ff7700] px-3 py-1.5 flex justify-between items-center text-black font-pixel text-xs sm:text-sm uppercase select-none">
          <div className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-base">
              {mode === 'LOGIN' ? 'lock' : 'person_add'}
            </span>
            <span>{mode === 'LOGIN' ? t('loginTitle') : t('registerTitle')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMinimized(true);
              }}
              className="w-6 h-6 bg-[#1d1e30] text-[#ff7700] border border-black flex items-center justify-center hover:bg-[#ff7700] hover:text-black font-bold text-xs cursor-pointer"
              title="Minimize window"
            >
              _
            </button>
            <button
              onClick={() => {
                soundFx.playClose();
                onClose();
              }}
              className="w-6 h-6 bg-[#1d1e30] text-[#ff7700] border border-black flex items-center justify-center hover:bg-[#ff7700] hover:text-black font-bold text-xs cursor-pointer"
              title="Close window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Inner Content */}
        <div className="p-5 space-y-4">
          {/* Subheader banner */}
          <div className="bg-[#111223] border-2 border-[#0b0d1d] p-2.5 text-center font-label text-xs text-[#59dbc0]">
            {mode === 'LOGIN' ? '>>> AUTHENTICATE SYSTEM USER' : '>>> CREATE NEW USER DATABASE RECORD'}
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-2.5 bg-[#581c20] border-2 border-[#f2b2b8] text-[#ffb4ab] font-label text-xs uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-[#004d40] border-2 border-[#00a68d] text-[#a7f3d0] font-label text-xs uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-3 font-label text-xs">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-[#ff7700] font-bold uppercase mb-1">
                  {t('nameLabel')} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ilyasiel_99"
                  className="w-full bg-[#111223] border-2 border-[#0b0d1d] px-3 py-2 text-[#e1e0f9] focus:outline-none focus:border-[#00a68d]"
                />
              </div>
            )}

            <div>
              <label className="block text-[#ff7700] font-bold uppercase mb-1">
                {t('emailLabel')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@retroshop.net"
                className="w-full bg-[#111223] border-2 border-[#0b0d1d] px-3 py-2 text-[#e1e0f9] focus:outline-none focus:border-[#00a68d]"
              />
            </div>

            <div>
              <label className="block text-[#ff7700] font-bold uppercase mb-1">
                {t('passwordLabel')} *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111223] border-2 border-[#0b0d1d] px-3 py-2 text-[#e1e0f9] focus:outline-none focus:border-[#00a68d]"
              />
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-[#ff7700] font-bold uppercase mb-1">
                  {t('confirmPasswordLabel')} *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111223] border-2 border-[#0b0d1d] px-3 py-2 text-[#e1e0f9] focus:outline-none focus:border-[#00a68d]"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full retro-btn bg-[#ff7700] text-black font-bold py-2.5 text-xs sm:text-sm uppercase flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  {mode === 'LOGIN' ? 'login' : 'how_to_reg'}
                </span>
                <span>{mode === 'LOGIN' ? t('loginButton') : t('registerButton')}</span>
              </button>

              {/* Demo Quick Login */}
              {mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full retro-btn bg-[#00a68d] text-black font-bold py-1.5 text-xs uppercase flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span>[ {t('demoLoginBtn')} ]</span>
                </button>
              )}
            </div>
          </form>

          {/* Switch Mode Link */}
          <div className="pt-2 border-t-2 border-[#0b0d1d] text-center">
            {mode === 'LOGIN' ? (
              <button
                type="button"
                onClick={() => handleSwitchMode('REGISTER')}
                className="text-[#59dbc0] hover:text-[#ff7700] font-label text-xs underline cursor-pointer"
              >
                {t('noAccountLink')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSwitchMode('LOGIN')}
                className="text-[#59dbc0] hover:text-[#ff7700] font-label text-xs underline cursor-pointer"
              >
                {t('hasAccountLink')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
