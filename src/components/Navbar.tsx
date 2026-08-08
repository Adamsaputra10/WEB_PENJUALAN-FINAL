import React, { useState } from 'react';
import { NavTab, Language, UserProfile, Theme } from '../types';
import { getTranslation } from '../lib/translations';
import { soundFx } from '../lib/sound';
import { Sun, Moon, Tv, Volume2, VolumeX, Globe, User, LogIn, LogOut, Terminal, ShoppingCart } from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartItemCount: number;
  language: Language;
  onLanguageToggle: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
  crtEnabled: boolean;
  onCrtToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  userProfile: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  cartItemCount,
  language,
  onLanguageToggle,
  theme,
  onThemeToggle,
  crtEnabled,
  onCrtToggle,
  soundEnabled,
  onSoundToggle,
  userProfile,
  onOpenLogin,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const handleTabClick = (tab: NavTab) => {
    soundFx.playClick();
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111223] border-b-4 border-[#ff7700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap justify-between items-center gap-2 sm:gap-3">
        {/* Logo */}
        <div 
          onClick={() => handleTabClick('HOME')} 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-[#00a68d] bg-[#1d1e30] flex items-center justify-center retro-shadow group-hover:bg-[#00a68d] transition-colors">
            <Terminal className="text-[#ff7700] group-hover:text-black w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-sm sm:text-base text-[#59dbc0] tracking-tighter uppercase drop-shadow-[2px_2px_0px_#000]">
              ILYASVIELSHOP STORE
            </span>
            <span className="font-label text-[9px] text-[#ff7700] tracking-wider uppercase font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a68d] animate-ping"></span>
              POS INTEGRATED
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleTabClick('HOME')}
            className={`font-label text-sm uppercase px-3 py-1.5 transition-colors ${
              currentTab === 'HOME'
                ? 'text-[#ffb68d] border-b-2 border-[#ff7700] font-bold bg-[#1d1e30]'
                : 'text-[#e1e0f9] opacity-80 hover:text-[#59dbc0] hover:opacity-100'
            }`}
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => handleTabClick('PRODUCTS')}
            className={`font-label text-sm uppercase px-3 py-1.5 transition-colors ${
              currentTab === 'PRODUCTS'
                ? 'text-[#ffb68d] border-b-2 border-[#ff7700] font-bold bg-[#1d1e30]'
                : 'text-[#e1e0f9] opacity-80 hover:text-[#59dbc0] hover:opacity-100'
            }`}
          >
            {t('navProducts')}
          </button>
          <button
            onClick={() => handleTabClick('CART')}
            className={`font-label text-sm uppercase px-3 py-1.5 transition-colors flex items-center gap-2 ${
              currentTab === 'CART'
                ? 'text-[#ffb68d] border-b-2 border-[#ff7700] font-bold bg-[#1d1e30]'
                : 'text-[#e1e0f9] opacity-80 hover:text-[#59dbc0] hover:opacity-100'
            }`}
          >
            <span>{t('navCart')}</span>
            {cartItemCount > 0 && (
              <span className="bg-[#ff7700] text-black font-pixel text-[10px] px-2 py-0.5 retro-border-sm">
                {cartItemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick('TRACK_ORDER')}
            className={`font-label text-sm uppercase px-3 py-1.5 transition-colors ${
              currentTab === 'TRACK_ORDER'
                ? 'text-[#ffb68d] border-b-2 border-[#ff7700] font-bold bg-[#1d1e30]'
                : 'text-[#e1e0f9] opacity-80 hover:text-[#59dbc0] hover:opacity-100'
            }`}
          >
            {t('navTrackOrder')}
          </button>
        </nav>

        {/* Right Controls: Theme, Lang, CRT FX, SFX, User, Mobile Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Retro Light / Dark Theme Switcher - ICON ONLY */}
          <button
            onClick={() => {
              soundFx.playClick();
              onThemeToggle();
            }}
            title={theme === 'light' 
              ? (language === 'ID' ? 'Mode Terang (Klik untuk beralih ke Mode Gelap)' : 'Light Mode (Click for Dark Mode)') 
              : (language === 'ID' ? 'Mode Gelap (Klik untuk beralih ke Mode Terang)' : 'Dark Mode (Click for Light Mode)')}
            className={`retro-btn h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-colors ${
              theme === 'light' ? 'bg-[#f4f1ea] text-[#121324] border-2 border-[#121324]' : 'bg-[#1d1e30] text-[#ff7700]'
            }`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7700]" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7700]" />
            )}
          </button>

          {/* CRT FX Toggle - ICON ONLY */}
          <button
            onClick={() => {
              soundFx.playClick();
              onCrtToggle();
            }}
            title={crtEnabled 
              ? (language === 'ID' ? 'Efek CRT: Aktif (Klik untuk Matikan)' : 'CRT Scanlines: ON (Click to Disable)') 
              : (language === 'ID' ? 'Efek CRT: Nonaktif (Klik untuk Aktifkan)' : 'CRT Scanlines: OFF (Click to Enable)')}
            className={`retro-btn h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-colors ${
              crtEnabled ? 'bg-[#00a68d] text-black' : 'bg-[#1d1e30] text-[#e1e0f9]'
            }`}
          >
            <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Toggle - ICON ONLY */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSoundToggle();
            }}
            title={soundEnabled 
              ? (language === 'ID' ? 'Suara SFX: Aktif (Klik untuk Matikan)' : 'Audio SFX: ON (Click to Mute)') 
              : (language === 'ID' ? 'Suara SFX: Nonaktif (Klik untuk Aktifkan)' : 'Audio SFX: OFF (Click to Unmute)')}
            className={`retro-btn h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-colors ${
              soundEnabled ? 'bg-[#ff7700] text-black' : 'bg-[#1d1e30] text-[#e1e0f9]'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Language Switcher - ICON ONLY */}
          <button
            onClick={() => {
              soundFx.playClick();
              onLanguageToggle(language === 'EN' ? 'ID' : 'EN');
            }}
            title={language === 'EN' 
              ? 'Bahasa: English (Klik untuk Bahasa Indonesia)' 
              : 'Bahasa: Indonesia (Klik untuk English)'}
            className={`retro-btn h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-colors ${
              language === 'ID' ? 'bg-[#ff7700] text-black' : 'bg-[#1d1e30] text-[#59dbc0]'
            }`}
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* User Account / Login Button - ICON ONLY */}
          {userProfile ? (
            <div className="relative">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowUserMenu(!showUserMenu);
                }}
                className="retro-btn h-8 w-8 sm:h-9 sm:w-9 bg-[#00a68d] text-black flex items-center justify-center"
                title={userProfile.name}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Retro Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1d1e30] border-2 border-[#00a68d] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 z-50 font-label text-xs space-y-2">
                  <div className="border-b-2 border-[#0b0d1d] pb-2">
                    <div className="text-[#59dbc0] font-bold truncate">{userProfile.name}</div>
                    <div className="text-[10px] text-[#e1e0f9]/70 truncate">{userProfile.email}</div>
                  </div>
                  <div className="text-[10px] text-[#ff7700]">
                    {t('welcomeUser')}, {userProfile.name}!
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full bg-[#ff7700] hover:bg-[#ff8822] text-black font-bold py-1 px-2 text-center text-xs uppercase retro-border-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenLogin();
              }}
              title={language === 'ID' ? 'Login Pengguna' : 'User Login'}
              className="retro-btn h-8 w-8 sm:h-9 sm:w-9 bg-[#00a68d] text-black flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Cart Icon Quick Trigger (Mobile) */}
          <button
            onClick={() => handleTabClick('CART')}
            title={t('navCart')}
            className="retro-btn bg-[#ff7700] text-black h-8 w-8 sm:h-9 sm:w-9 font-label text-xs sm:text-sm flex items-center justify-center gap-1 md:hidden"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartItemCount > 0 && (
              <span className="font-pixel text-[9px] font-bold">({cartItemCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="flex md:hidden border-t-2 border-[#0b0d1d] bg-[#1d1e30] justify-around py-1.5 px-1 text-[11px] sm:text-xs font-label">
        <button
          onClick={() => handleTabClick('HOME')}
          className={`px-1.5 py-0.5 uppercase ${currentTab === 'HOME' ? 'text-[#ff7700] font-bold border-b-2 border-[#ff7700]' : 'text-[#e1e0f9]'}`}
        >
          {t('navHome')}
        </button>
        <button
          onClick={() => handleTabClick('PRODUCTS')}
          className={`px-1.5 py-0.5 uppercase ${currentTab === 'PRODUCTS' ? 'text-[#ff7700] font-bold border-b-2 border-[#ff7700]' : 'text-[#e1e0f9]'}`}
        >
          {t('navProducts')}
        </button>
        <button
          onClick={() => handleTabClick('CART')}
          className={`px-1.5 py-0.5 uppercase flex items-center gap-1 ${currentTab === 'CART' ? 'text-[#ff7700] font-bold border-b-2 border-[#ff7700]' : 'text-[#e1e0f9]'}`}
        >
          {t('navCart')} ({cartItemCount})
        </button>
        <button
          onClick={() => handleTabClick('TRACK_ORDER')}
          className={`px-1.5 py-0.5 uppercase ${currentTab === 'TRACK_ORDER' ? 'text-[#ff7700] font-bold border-b-2 border-[#ff7700]' : 'text-[#e1e0f9]'}`}
        >
          {t('navTrackOrder')}
        </button>
      </div>
    </header>
  );
};
