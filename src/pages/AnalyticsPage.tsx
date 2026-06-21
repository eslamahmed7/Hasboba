import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BarChart3, Settings, Download, TrendingDown, ChevronDown,
  ChevronRight, Moon, Sun, Globe, Bell, LogOut, Shield, Info,
  Bot, MessageSquare, PieChart, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AICoachPage } from './AICoachPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
import { AdminDashboard } from './AdminDashboard';

interface AnalyticsPageProps {
  onOpenNotifications?: () => void;
  onRequireUpgrade?: () => void;
}

export function AnalyticsPage({ onOpenNotifications, onRequireUpgrade }: AnalyticsPageProps) {
  const { user, balance, transactions, isDark, toggleTheme } = useApp();
  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  const [activeView, setActiveView] = useState<'home' | 'ai' | 'reports' | 'settings' | 'admin'>('home');

  // AI Chat modal state
  const [showAIModal, setShowAIModal] = useState(false);

  // Quick stats for the home view
  const spendingPct = balance.income > 0 ? Math.round((balance.expenses / balance.income) * 100) : 0;
  const savingsRate = 100 - spendingPct;

  const menuItems = [
    {
      id: 'ai',
      label: 'المستشار الذكي',
      desc: 'تحليل مالي بالذكاء الاصطناعي',
      icon: Sparkles,
      color: '#facc15',
      gradient: 'from-[#2d1b00] to-[#1a0d00]',
      border: 'border-[#facc15]/20',
      isPro: true,
    },
    {
      id: 'reports',
      label: 'التقارير التفصيلية',
      desc: 'مصاريف، دخل، رسوم بيانية',
      icon: PieChart,
      color: '#60a5fa',
      gradient: 'from-[#0c1a33] to-[#081229]',
      border: 'border-[#60a5fa]/20',
      isPro: false,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      desc: 'الملف الشخصي، اللغة، المظهر',
      icon: Settings,
      color: '#9ca3af',
      gradient: 'from-[#111827] to-[#0d1421]',
      border: 'border-[#1f2937]',
      isPro: false,
    },
  ];

  if (activeView === 'ai') {
    return <AICoachPage onClose={() => setActiveView('home')} onRequireUpgrade={() => { setActiveView('home'); if (onRequireUpgrade) onRequireUpgrade(); }} />;
  }
  if (activeView === 'reports') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-5 pb-2 flex items-center">
          <button onClick={() => setActiveView('home')} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition-colors">
            <ChevronRight size={18} className="rotate-180" />
            رجوع
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ReportsPage />
        </div>
      </div>
    );
  }
  if (activeView === 'settings') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-5 pb-2 flex items-center">
          <button onClick={() => setActiveView('home')} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition-colors">
            <ChevronRight size={18} className="rotate-180" />
            رجوع
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SettingsPage onOpenNotifications={onOpenNotifications || (() => {})} onOpenAdmin={() => setActiveView('admin')} />
        </div>
      </div>
    );
  }
  if (activeView === 'admin' && user?.isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-5 pb-2 flex items-center">
          <button onClick={() => setActiveView('settings')} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition-colors">
            <ChevronRight size={18} className="rotate-180" />
            رجوع للإعدادات
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#facc15]/10 border border-[#facc15]/20 flex items-center justify-center">
            <Sparkles size={16} className="text-[#facc15]" />
          </div>
          <h1 className="text-white font-bold text-xl">التحليلات والمستشار</h1>
        </div>
        <p className="text-gray-500 text-xs text-right">تقاريرك، نصائح الذكاء الاصطناعي، الإعدادات</p>
      </div>

      {/* Financial Health Card */}
      <div className="px-5 mb-5">
        <div className="bg-gradient-to-br from-[#111827] to-[#0d1421] border border-[#1f2937] rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              savingsRate >= 30 ? 'bg-[#4ade80]/10 text-[#4ade80]' :
              savingsRate >= 10 ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-400'
            }`}>
              {savingsRate >= 30 ? '💚 وضع مالي ممتاز' : savingsRate >= 10 ? '🟡 وضع مقبول' : '🔴 يحتاج تحسين'}
            </div>
            <h3 className="text-white font-bold text-sm">الصحة المالية</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'الرصيد', value: fmt(balance.current), color: balance.current >= 0 ? 'text-white' : 'text-red-400' },
              { label: 'نسبة الادخار', value: `${savingsRate}%`, color: savingsRate >= 20 ? 'text-[#4ade80]' : 'text-yellow-400' },
              { label: 'صافي الدخل', value: fmt(balance.income), color: 'text-[#4ade80]' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#0a0d13]/50 rounded-2xl p-3 text-center">
                <p className={`${stat.color} font-black text-base`}>{stat.value}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Spending Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">المصاريف {spendingPct}%</span>
              <span className="text-gray-500">الادخار المحتمل {Math.max(0, savingsRate)}%</span>
            </div>
            <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden flex">
              <div className="h-full bg-red-500 rounded-l-full transition-all duration-1000" style={{ width: `${Math.min(spendingPct, 100)}%` }} />
              <div className="h-full bg-[#4ade80] rounded-r-full transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Tip of the Day */}
      {transactions.length > 0 && (
        <div className="px-5 mb-5">
          <div className="bg-gradient-to-r from-[#2d1b00] to-[#1a1000] border border-[#facc15]/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#facc15]/20 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-[#facc15]" />
            </div>
            <div className="text-right flex-1">
              <p className="text-[#facc15] text-xs font-bold mb-1">💡 نصيحة اليوم</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                {spendingPct > 80
                  ? `أنت تنفق ${spendingPct}% من دخلك! حاول تخفيض أكبر فئة مصروف بـ 20%.`
                  : spendingPct > 50
                  ? `نسبة إنفاقك ${spendingPct}%. تقدر توفر أكثر بتحديد ميزانية لكل فئة.`
                  : `نسبة الادخار المحتملة ${savingsRate}%. ممتاز! فكّر في استثمار الفائض.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Cards */}
      <div className="px-5 flex flex-col gap-3">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.isPro && user?.plan !== 'pro') {
                  if (onRequireUpgrade) onRequireUpgrade();
                  return;
                }
                setActiveView(item.id as any);
              }}
              className={`w-full bg-gradient-to-r ${item.gradient} border ${item.border} rounded-2xl p-4 flex items-center gap-4 text-right`}
            >
              <ChevronRight size={18} className="text-gray-600 shrink-0 rotate-180" />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-0.5">
                  {item.isPro && (
                    <span className="text-[10px] bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20 px-2 py-0.5 rounded-full font-bold">PRO</span>
                  )}
                  <p className="text-white font-bold text-sm">{item.label}</p>
                </div>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0" style={{ backgroundColor: item.color + '15', borderColor: item.color + '30' }}>
                <Icon size={22} style={{ color: item.color }} />
              </div>
            </motion.button>
          );
        })}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 text-right">
            <p className="text-gray-500 text-xs mb-1">عدد المعاملات</p>
            <p className="text-white font-black text-2xl">{transactions.length}</p>
            <p className="text-gray-600 text-[10px] mt-1">معاملة مسجلة</p>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 text-right">
            <p className="text-gray-500 text-xs mb-1">متوسط الإنفاق</p>
            <p className="text-white font-black text-2xl">
              {transactions.length > 0
                ? fmt(Math.round(balance.expenses / Math.max(transactions.filter(t => t.type === 'expense').length, 1)))
                : '0'}
            </p>
            <p className="text-gray-600 text-[10px] mt-1">{sym} / معاملة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
