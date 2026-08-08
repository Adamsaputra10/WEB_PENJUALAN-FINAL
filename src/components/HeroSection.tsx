import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../lib/translations';
import { soundFx } from '../lib/sound';

interface HeroSectionProps {
  language: Language;
  onViewProducts: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ language, onViewProducts }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  return (
    <section className="w-full flex flex-col md:flex-row items-center gap-8 py-8 sm:py-12 border-b-4 border-[#0b0d1d]">
      {/* Left Text */}
      <div className="w-full md:w-1/2 flex flex-col items-start gap-5">
        <div className="inline-flex items-center gap-2 bg-[#00a68d] text-black font-pixel text-xs px-3 py-1 retro-border-sm retro-shadow">
          <span className="w-2.5 h-2.5 bg-[#ff7700] animate-ping rounded-full inline-block"></span>
          <span>ILYASVIELSHOP POS ONLINE</span>
        </div>

        <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl font-bold text-[#ff7700] uppercase tracking-tighter leading-none drop-shadow-[4px_4px_0px_#0b0d1d]">
          {t('heroTitleLine1')}<br />
          <span className="text-[#59dbc0]">{t('heroTitleLine2')}</span>
        </h1>

        <p className="font-body text-base sm:text-lg text-[#e0c0b0] max-w-md bg-[#1d1e30] p-4 retro-border-sm pixel-inset">
          {t('heroSubtitle1')}<br />
          <span className="text-[#ffb68d] font-bold">{t('heroSubtitle2')}</span>
        </p>

        <div className="flex flex-wrap gap-4 mt-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onViewProducts();
            }}
            className="retro-btn-lg bg-[#ff7700] text-black font-label text-base font-bold px-8 py-4 uppercase flex items-center gap-3 hover:bg-[#ffb68d]"
          >
            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
            <span>{t('viewProducts')}</span>
          </button>
        </div>
      </div>

      {/* Right Window Screen */}
      <div className="w-full md:w-1/2 flex justify-center relative">
        {isClosed ? (
          <div className="w-full max-w-md bg-[#1d1e30] border-2 border-[#584235] p-6 text-center space-y-4">
            <p className="font-pixel text-xs text-[#ffb68d] uppercase">&gt; SYSTEM WINDOW CLOSED</p>
            <button
              onClick={() => {
                soundFx.playClick();
                setIsClosed(false);
                setIsMinimized(false);
              }}
              className="retro-btn bg-[#00a68d] text-black font-label text-xs font-bold px-4 py-2 uppercase"
            >
              [ + ] REOPEN SYSTEM WINDOW
            </button>
          </div>
        ) : (
          <div className={`w-full ${isMaximized ? 'max-w-lg scale-105' : 'max-w-md'} relative z-10 retro-window bg-[#1d1e30] flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="window-header bg-[#00a68d] px-3 py-1.5 flex justify-between items-center text-black">
              <span className="font-label text-xs font-bold text-black uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">desktop_windows</span>
                SYSTEM
              </span>
              <div className="window-controls flex items-center gap-1">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMinimized((prev) => !prev);
                  }}
                  className="win-btn bg-[#1d1e30] text-[#00a68d] hover:bg-black hover:text-[#00a68d] cursor-pointer font-bold px-1.5 py-0.5"
                  title="Minimize window"
                >
                  _
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMaximized((prev) => !prev);
                  }}
                  className="win-btn bg-[#1d1e30] text-[#00a68d] hover:bg-black hover:text-[#00a68d] cursor-pointer font-bold px-1.5 py-0.5"
                  title="Maximize window"
                >
                  []
                </button>
                <button
                  onClick={() => {
                    soundFx.playClose();
                    setIsClosed(true);
                  }}
                  className="win-btn bg-[#ff7700] text-black hover:bg-[#ffb68d] cursor-pointer font-bold px-1.5 py-0.5"
                  title="Close window"
                >
                  X
                </button>
              </div>
            </div>

            {/* Canvas area */}
            {!isMinimized && (
              <div className="flex-grow flex flex-col items-center justify-center p-4 bg-[#191a2b] relative overflow-hidden pixel-inset aspect-square">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkaCbDyIZs9I7J03teeyM1sbgLwVAylwIj7Iyi495MYnAml8ODlJsneAoVTM4OxH7slJYYhOG167hsimHbh6Ha40f7H_f2nD8Cv1kbu9AT5IMhiMGkur10gSdrka1sV4Or72M-Kx4hrYwUr6y7zAgobQyl4MNNdakoPSoVZF8JIjNLsiAMYaVjFaI6pNVGVmS26jkqHQlZRn12P9njuqVt69YSU-IF2GBvuq3Ty2ytS_QY97IQmTLq"
                  alt="Retro 90s Computer Setup"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover border-2 border-[#0b0d1d] retro-shadow filter drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                />
                {/* Overlay badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#111223]/90 border-2 border-[#ff7700] p-2 text-center retro-shadow">
                  <p className="font-pixel text-[10px] text-[#ff7700] uppercase">
                    &gt; ILYASVIELSHOP POS TERMINAL READY
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Glow backdrop decorative elements */}
        <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-[#ff7700] rounded-full opacity-20 blur-2xl z-0 pointer-events-none"></div>
        <div className="absolute top-6 -left-6 w-40 h-40 bg-[#00a68d] rounded-full opacity-20 blur-2xl z-0 pointer-events-none"></div>
      </div>
    </section>
  );
};
