import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const ReportsWidget: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-4 h-full">
      <h3 className="text-xl font-bold text-white text-right mb-2">{t('reports.title')}</h3>
      
      <div className="bg-[#161e2e] rounded-2xl p-6 border border-white/5 flex flex-col gap-6 shadow-xl h-full relative">
        <span className="text-xs text-center text-gray-400 font-medium">{t('reports.subtitle')}</span>
        
        <div className="flex-1 flex justify-center items-center relative py-4">
          {/* Labels around the donut */}
          <div className="absolute top-0 right-0 text-xs text-gray-400">{t('reports.food')}</div>
          <div className="absolute bottom-4 right-0 text-xs text-gray-400 max-w-[40px] text-right">{t('reports.health')}, {t('reports.etc')}</div>
          <div className="absolute bottom-0 left-0 text-xs text-gray-400">{t('reports.health')}</div>
          <div className="absolute top-4 left-0 text-xs text-gray-400">{t('reports.entertainment')}</div>

          {/* Simple CSS Donut Chart */}
          <div className="w-32 h-32 rounded-full border-[16px] border-[#1a2333] relative flex items-center justify-center">
            {/* Donut segments using conic-gradient on a pseudo-element behind a cover */}
            <div 
              className="absolute inset-[-16px] rounded-full"
              style={{
                background: 'conic-gradient(#6366f1 0deg 90deg, #f97316 90deg 180deg, #ec4899 180deg 270deg, #22c55e 270deg 360deg)',
                WebkitMask: 'radial-gradient(transparent 55%, black 56%)',
                mask: 'radial-gradient(transparent 55%, black 56%)'
              }}
            />
            {/* Center hole color to match card bg */}
            <div className="w-20 h-20 bg-[#161e2e] rounded-full z-10 absolute" />
          </div>
        </div>

        <button className="w-full bg-[#8b8df8] hover:bg-[#7274f6] text-black font-bold py-3 rounded-xl transition-colors mt-auto shadow-lg">
          {t('reports.export')}
        </button>
      </div>
    </div>
  );
};
