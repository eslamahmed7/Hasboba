import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const DebtWidget: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white text-right mb-2">{t('debts.title')}</h3>
      
      <div className="flex gap-4">
        {/* Left Card - Owed to me */}
        <div className="flex-1 bg-[#161e2e] rounded-2xl p-4 border border-white/5 flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-white">{t('debts.owed.to.me')}</span>
              <span className="text-xs text-gray-500 font-medium">{t('debts.leit')}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            {/* Empty state: No people owe you */}
            <span className="text-xs text-gray-500 italic py-3">{t('debts.leit')} فارغ</span>
          </div>

          <div className="mt-4 flex flex-col items-end border-t border-white/10 pt-4">
             <span className="text-sm font-bold text-white">{t('debts.owed.to.me')}</span>
             <span className="text-[#3ff18e] font-bold">0 {t('currency')}</span>
          </div>

          <div className="flex gap-2 mt-2">
            <button className="flex-1 bg-[#3ff18e] text-black font-bold py-2 rounded-lg hover:bg-[#32d87e] transition-colors">
              {t('debts.nudge')}
            </button>
            <button className="flex-1 bg-[#23352a] text-[#3ff18e] font-bold py-2 rounded-lg border border-[#3ff18e]/30 hover:bg-[#2b4234] transition-colors flex items-center justify-center gap-1">
              {t('debts.whatsapp')}
            </button>
          </div>
        </div>

        {/* Right Card - I Owe */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-[#161e2e] rounded-2xl p-4 border border-white/5 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold text-white">{t('debts.i.owe')}</span>
                <span className="text-xs text-gray-500 font-medium">{t('debts.subtitle')}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              {/* Empty state: You don't owe anyone */}
              <span className="text-xs text-gray-500 italic py-3">{t('debts.subtitle')} فارغ</span>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-[#3ff18e] text-black font-bold py-2 rounded-lg hover:bg-[#32d87e] transition-colors">
                {t('debts.nudge')}
              </button>
              <button className="flex-1 bg-[#23352a] text-[#3ff18e] font-bold py-2 rounded-lg border border-[#3ff18e]/30 hover:bg-[#2b4234] transition-colors flex items-center justify-center gap-1">
                {t('debts.whatsapp')}
              </button>
            </div>
          </div>

          <div className="bg-[#161e2e] rounded-2xl p-4 border border-white/5 flex flex-col shadow-xl">
             <div className="flex justify-between items-center mb-2">
               <span className="text-lg font-bold text-white">{t('debts.i.owe')}</span>
               <span className="text-[#f1633f] font-bold">0 {t('currency')}</span>
             </div>
             <div className="flex justify-between items-center opacity-50">
               <span className="text-xs text-gray-500 font-medium">{t('debts.sister')}</span>
               <span className="text-[#f1633f] font-bold text-sm">0 {t('currency')}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
