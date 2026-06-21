import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Sun, RefreshCw, ChevronLeft } from 'lucide-react';

export const SettingsWidget: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-xl font-bold text-white">{t('settings.title')}</h3>
         <div className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center">
            <SettingsIcon size={14} className="text-gray-400" />
         </div>
      </div>
      
      <div className="bg-[#161e2e] rounded-2xl p-4 border border-white/5 flex flex-col gap-4 shadow-xl">
        
        {/* Currency */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a2333] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} className="text-gray-500" />
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-white">{t('settings.currency')}</span>
             <span className="text-lg">🇪🇬</span>
          </div>
        </div>

        {/* Language */}
        <div 
          className="flex items-center justify-between p-3 rounded-xl bg-[#1a2333] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={toggleLanguage}
        >
          <ChevronLeft size={18} className="text-gray-500" />
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-white">{t('settings.language')}</span>
             <Globe size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Night Mode */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a2333] border border-white/5">
          <div className="w-10 h-6 bg-[#8b8df8] rounded-full relative cursor-pointer">
             <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-white">{t('settings.nightmode')}</span>
             <Sun size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a2333] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 87.3 80" className="w-6 h-6">
              <path d="M58.3 80h-29L0 29.5l14.7-25 29 50.5z" fill="#00832d"/>
              <path d="M87.3 29.5H29L14.7 4.5 29.2 0l58.1 29.5z" fill="#0066da"/>
              <path d="M58.3 80L87.3 29.5 72.8 4.5 43.6 55z" fill="#e92a2b"/>
              <path d="M58.3 80h-29L14.7 55l14.5-25.5L58.3 80z" fill="#26a454"/>
              <path d="M87.3 29.5H29L43.6 55h58.2z" fill="#4285f4"/>
              <path d="M58.3 80L43.6 55 29.2 29.5 43.6 4.5 72.8 4.5z" fill="#fbbc04"/>
            </svg>
            <span className="text-sm font-bold text-white whitespace-pre-wrap text-right">{t('settings.cloudsync')}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#8b8df8]/20 flex items-center justify-center">
            <RefreshCw size={16} className="text-[#8b8df8]" />
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple Settings Icon for the header
const SettingsIcon = ({size, className}: {size: number, className: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
)
