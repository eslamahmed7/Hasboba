import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PiggyBank, Medal } from 'lucide-react';

export const SavingsWidget: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white text-right mb-2">{t('savings.title')}</h3>
      
      <div className="bg-[#161e2e] rounded-2xl p-6 border border-white/5 flex flex-col gap-6 shadow-xl relative overflow-hidden">
        {/* Level and Progress */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-400 font-bold">{t('savings.level')} 0</span>
          <div className="h-2 bg-dark-600 rounded-full w-2/3">
             <div className="h-full w-[0%] bg-[#3ff18e] rounded-full shadow-[0_0_10px_#3ff18e]" />
          </div>
        </div>

        {/* Center Diagram (Piggy Bank) */}
        <div className="flex justify-center items-center py-6 relative">
          <div className="absolute top-0 right-10 text-xs text-gray-400 font-bold flex flex-col items-center">
            <span>{t('savings.laptop')}</span>
            <div className="h-10 border-r-2 border-dashed border-[#3ff18e]/50 mt-1" />
          </div>
          
          <div className="absolute bottom-10 left-10 text-xs text-gray-400 font-bold flex flex-col items-center">
            <div className="h-10 border-r-2 border-dashed border-[#3ff18e]/50 mb-1" />
            <span>{t('savings.mall')}</span>
          </div>

          <div className="relative">
            <PiggyBank size={80} className="text-[#3ff18e] drop-shadow-[0_0_15px_rgba(63,241,142,0.4)]" strokeWidth={1} />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-bold whitespace-nowrap">
              {t('savings.control')}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="flex flex-col gap-4 mt-6">
          <span className="text-sm text-right text-gray-400 font-bold">{t('savings.achievements')}</span>
          <div className="flex justify-around items-center">
            <div className="relative">
              <Medal size={48} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
            </div>
            <div className="relative">
              <Medal size={48} className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
            </div>
            <div className="relative">
              <Medal size={48} className="text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.3)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
