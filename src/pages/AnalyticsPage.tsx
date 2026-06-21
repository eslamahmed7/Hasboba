import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, BarChart3, Settings, PieChart, Zap, ChevronRight, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AICoachPage } from './AICoachPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
import { AdminDashboard } from './AdminDashboard';
import type { TabType } from '../types';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BG_CARD2 = '#162a2f';
const BORDER  = '#1e3035';

interface AnalyticsPageProps {
  onOpenNotifications?: () => void;
  onRequireUpgrade?: () => void;
  onNavigate?: (tab: TabType) => void;
}

export function AnalyticsPage({ onOpenNotifications, onRequireUpgrade, onNavigate }: AnalyticsPageProps) {
  const { user, balance, transactions } = useApp();
  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  const [activeView, setActiveView] = useState<'home' | 'ai' | 'reports' | 'settings' | 'admin'>('home');

  const spendingPct = balance.income > 0 ? Math.round((balance.expenses / balance.income) * 100) : 0;
  const savingsRate  = Math.max(0, 100 - spendingPct);

  const menuItems = [
    {
      id: 'social',
      label: 'التحويش والديون',
      desc: 'أهداف الادخار وتسجيل السلف',
      icon: Users,
      color: '#00adb5',
      isPro: false,
    },
    {
      id: 'ai',
      label: 'المستشار الذكي',
      desc: 'تحليل مالي بالذكاء الاصطناعي',
      icon: Sparkles,
      color: '#facc15',
      isPro: true,
    },
    {
      id: 'reports',
      label: 'التقارير التفصيلية',
      desc: 'مصاريف، دخل، رسوم بيانية',
      icon: PieChart,
      color: '#60a5fa',
      isPro: false,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      desc: 'الملف الشخصي، اللغة، المظهر',
      icon: Settings,
      color: '#9ca3af',
      isPro: false,
    },
  ];

  if (activeView === 'ai')
    return <AICoachPage onClose={() => setActiveView('home')}
              onRequireUpgrade={() => { setActiveView('home'); onRequireUpgrade?.(); }} />;

  if (activeView === 'reports')
    return (
      <div className="flex flex-col h-full" style={{ background: BG_BASE }}>
        <div className="px-5 pt-5 pb-2 flex items-center">
          <button onClick={() => setActiveView('home')}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: '#6a9ca2' }}>
            <ChevronRight size={18} className="rotate-180" /> رجوع
          </button>
        </div>
        <div className="flex-1 overflow-hidden"><ReportsPage /></div>
      </div>
    );

  if (activeView === 'settings')
    return (
      <div className="flex flex-col h-full" style={{ background: BG_BASE }}>
        <div className="px-5 pt-5 pb-2 flex items-center">
          <button onClick={() => setActiveView('home')}
            className="flex items-center gap-1 text-sm"
            style={{ color: '#6a9ca2' }}>
            <ChevronRight size={18} className="rotate-180" /> رجوع
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SettingsPage onOpenNotifications={onOpenNotifications || (() => {})}
            onOpenAdmin={() => setActiveView('admin')} />
        </div>
      </div>
    );

  if (activeView === 'admin' && user?.isAdmin)
    return (
      <div className="flex flex-col h-full" style={{ background: BG_BASE }}>
        <div className="px-5 pt-5 pb-2 flex items-center">
          <button onClick={() => setActiveView('settings')}
            className="flex items-center gap-1 text-sm"
            style={{ color: '#6a9ca2' }}>
            <ChevronRight size={18} className="rotate-180" /> رجوع للإعدادات
          </button>
        </div>
        <div className="flex-1 overflow-hidden"><AdminDashboard /></div>
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28" style={{ background: BG_BASE }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-white font-bold text-xl text-right">التحليلات والمستشار</h1>
        <p className="text-xs mt-0.5 text-right" style={{ color: '#6a9ca2' }}>تقاريرك، نصائح الذكاء الاصطناعي، الإعدادات</p>
      </div>

      {/* ── Financial Health Card ─────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${BG_CARD2} 0%, #0f1d20 100%)`, border: `1px solid ${BORDER}` }}>
          <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-10 blur-3xl" style={{ background: ACCENT }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                savingsRate >= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                savingsRate >= 10 ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {savingsRate >= 30 ? '💚 وضع مالي ممتاز' : savingsRate >= 10 ? '🟡 وضع مقبول' : '🔴 يحتاج تحسين'}
              </div>
              <h3 className="text-white font-bold text-sm">الصحة المالية</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'الرصيد',      value: fmt(balance.current), color: balance.current >= 0 ? 'white' : '#fb7185' },
                { label: 'نسبة الادخار', value: `${savingsRate}%`,  color: savingsRate >= 20 ? '#34d399' : '#fbbf24' },
                { label: 'صافي الدخل',  value: fmt(balance.income),  color: '#34d399' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-3 text-center"
                  style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="font-black text-base" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#4a7a80' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Spending bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: '#4a7a80' }}>الادخار {savingsRate}%</span>
                <span style={{ color: '#4a7a80' }}>المصاريف {spendingPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex" style={{ background: BORDER }}>
                <div className="h-full rounded-r-full transition-all duration-1000"
                  style={{ width: `${Math.min(spendingPct, 100)}%`, background: '#f43f5e' }} />
                <div className="h-full rounded-l-full transition-all duration-1000"
                  style={{ width: `${Math.min(savingsRate, 100)}%`, background: '#34d399' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Tip ────────────────────────────────────────────────────────────── */}
      {transactions.length > 0 && (
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(250,204,21,0.15)' }}>
              <Zap size={18} style={{ color: '#facc15' }} />
            </div>
            <div className="text-right flex-1">
              <p className="text-xs font-bold mb-1" style={{ color: '#facc15' }}>💡 نصيحة اليوم</p>
              <p className="text-xs leading-relaxed" style={{ color: '#a0b8bc' }}>
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

      {/* ── Menu Cards ────────────────────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-3 mb-4">
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
                if (item.isPro && user?.plan !== 'pro') { onRequireUpgrade?.(); return; }
                if (item.id === 'social') {
                  onNavigate?.('social');
                  return;
                }
                setActiveView(item.id as any);
              }}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-right"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
            >
              <ChevronRight size={18} style={{ color: '#2d4a50' }} className="rotate-180 shrink-0" />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-0.5">
                  {item.isPro && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}>
                      PRO
                    </span>
                  )}
                  <p className="text-white font-bold text-sm">{item.label}</p>
                </div>
                <p className="text-xs" style={{ color: '#4a7a80' }}>{item.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: item.color + '18', border: `1px solid ${item.color}30` }}>
                <Icon size={22} style={{ color: item.color }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Quick Stats ───────────────────────────────────────────────────────── */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 text-right" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-xs mb-1" style={{ color: '#4a7a80' }}>عدد المعاملات</p>
          <p className="text-white font-black text-2xl">{transactions.length}</p>
          <p className="text-[10px] mt-1" style={{ color: '#3a6068' }}>معاملة مسجلة</p>
        </div>
        <div className="rounded-2xl p-4 text-right" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-xs mb-1" style={{ color: '#4a7a80' }}>متوسط الإنفاق</p>
          <p className="text-white font-black text-2xl">
            {transactions.length > 0
              ? fmt(Math.round(balance.expenses / Math.max(transactions.filter(t => t.type === 'expense').length, 1)))
              : '0'}
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#3a6068' }}>{sym} / معاملة</p>
        </div>
      </div>
    </div>
  );
}
