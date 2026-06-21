import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Wifi, Dumbbell, PlaySquare, MonitorPlay } from 'lucide-react';

export const SubscriptionsWidget: React.FC = () => {
  const { t } = useLanguage();
  
  const subs: any[] = [];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white text-right mb-2">{t('subs.title')}</h3>
      
      <div className="bg-[#161e2e] rounded-2xl p-4 border border-white/5 flex flex-col gap-3 shadow-xl">
        <span className="text-xs text-right text-gray-500 font-medium mb-2">{t('subs.subtitle')}</span>
        
        {subs.map((sub, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#1a2333] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                {sub.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{sub.name}</span>
                <span className="text-xs text-gray-500 mt-1">{sub.date}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white">{sub.price1} {t('currency')}</span>
              <span className="text-xs text-gray-500 mt-1">{sub.price2} {t('currency')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
