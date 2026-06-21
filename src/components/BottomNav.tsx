import { motion } from 'framer-motion';
import { Home, HandCoins, PiggyBank, BarChart2, Settings } from 'lucide-react';
import type { TabType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const navItems = [
  { id: 'settings' as TabType, icon: Settings, label: 'إعدادات' },
  { id: 'reports' as TabType, icon: BarChart2, label: 'تقارير' },
  { id: 'dashboard' as TabType, icon: Home, label: 'الرئيسية' },
  { id: 'savings' as TabType, icon: PiggyBank, label: 'التحويش' },
  { id: 'debts' as TabType, icon: HandCoins, label: 'الديون' },
];

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="w-full flex justify-around items-center px-2 py-4">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex flex-col items-center justify-center gap-1 transition-all duration-200 min-w-[48px]"
          >
            {item.id === 'dashboard' ? (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#3ff18e] shadow-[0_0_20px_rgba(63,241,142,0.4)]'
                    : 'bg-white/10'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-black' : 'text-gray-400'} strokeWidth={2} />
              </motion.div>
            ) : (
              <>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-[#3ff18e] drop-shadow-[0_0_6px_rgba(63,241,142,0.7)]'
                      : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-[#3ff18e]' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#3ff18e]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
