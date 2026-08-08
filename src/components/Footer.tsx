import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getTranslation } from '../lib/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full py-8 px-4 border-t-4 border-[#584235] bg-[#0b0d1d] text-[#d7c4a8] mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
        {/* Retro Logo & Ticker */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="font-pixel text-[#ff7700] text-xs sm:text-sm uppercase tracking-widest">
            ILYASVIELSHOP STORE & POS SYSTEM
          </span>
          <span className="hidden sm:inline text-[#584235]">|</span>
          <span className="font-label text-xs text-[#59dbc0] bg-[#1d1e30] px-3 py-1 retro-border-sm">
            SYS_TIME: {timeString || '12:00:00 PM'}
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 font-label text-xs uppercase">
          <a href="#support" onClick={(e) => e.preventDefault()} className="text-[#e0c0b0] opacity-80 hover:opacity-100 hover:text-[#ff7700] transition-colors">
            {t('support')}
          </a>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#e0c0b0] opacity-80 hover:opacity-100 hover:text-[#ff7700] transition-colors">
            {t('privacy')}
          </a>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#e0c0b0] opacity-80 hover:opacity-100 hover:text-[#ff7700] transition-colors">
            {t('terms')}
          </a>
          <a href="#webring" onClick={(e) => e.preventDefault()} className="text-[#e0c0b0] opacity-80 hover:opacity-100 hover:text-[#ff7700] transition-colors">
            {t('webring')}
          </a>
        </div>

        {/* 90s Webring Banner */}
        <div className="inline-flex items-center gap-3 bg-[#1d1e30] border-2 border-[#0b0d1d] p-2 retro-shadow text-xs font-label">
          <span className="bg-[#ff7700] text-black px-1.5 py-0.5 font-bold">[90s WEBRING]</span>
          <span className="text-[#e1e0f9]">MEMBER #0984</span>
          <span className="text-[#59dbc0] cursor-pointer hover:underline">[PREV]</span>
          <span className="text-[#59dbc0] cursor-pointer hover:underline">[RANDOM]</span>
          <span className="text-[#59dbc0] cursor-pointer hover:underline">[NEXT]</span>
        </div>

        {/* Copyright */}
        <div className="font-body text-xs text-[#e0c0b0] opacity-70 max-w-md">
          {t('copyright')}
        </div>
      </div>
    </footer>
  );
};
