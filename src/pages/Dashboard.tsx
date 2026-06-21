import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, TrendingUp, TrendingDown, Trash2, Bell,
  Utensils, Car, Gamepad2, ShoppingBag, HeartPulse, Receipt,
  GraduationCap, Gift, Home, User, MoreHorizontal,
  Briefcase, Laptop, BarChart2, Sparkles, Eye, EyeOff, Wallet, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TabType } from '../types';

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT       = '#00adb5';
const BG_CARD      = '#132226';
const BORDER       = '#1e3035';
const BG_DEEP      = '#0b1315';

const iconMap: Record<string, React.ElementType> = {
  utensils: Utensils, car: Car, 'gamepad-2': Gamepad2,
  'shopping-bag': ShoppingBag, 'heart-pulse': HeartPulse, receipt: Receipt,
  'graduation-cap': GraduationCap, gift: Gift, home: Home, user: User,
  briefcase: Briefcase, laptop: Laptop, 'bar-chart-2': BarChart2,
  sparkles: Sparkles, 'more-horizontal': MoreHorizontal,
};

const expenseCategories = [
  { id: '1',  name: 'طعام',     icon: 'utensils',        color: '#f97316' },
  { id: '2',  name: 'مواصلات', icon: 'car',             color: '#3b82f6' },
  { id: '3',  name: 'تسوق',    icon: 'shopping-bag',    color: '#ec4899' },
  { id: '4',  name: 'فواتير',  icon: 'receipt',         color: '#eab308' },
  { id: '5',  name: 'ترفيه',   icon: 'gamepad-2',       color: '#a855f7' },
  { id: '6',  name: 'صحة',     icon: 'heart-pulse',     color: '#ef4444' },
  { id: '7',  name: 'تعليم',   icon: 'graduation-cap',  color: '#6366f1' },
  { id: '8',  name: 'هدايا',   icon: 'gift',            color: '#f43f5e' },
  { id: '9',  name: 'سكن',     icon: 'home',            color: '#14b8a6' },
  { id: '10', name: 'شخصي',    icon: 'user',            color: '#6b7280' },
  { id: '11', name: 'استثمار', icon: 'bar-chart-2',     color: ACCENT },
  { id: '12', name: 'أخرى',   icon: 'more-horizontal',  color: '#64748b' },
];

const incomeCategories = [
  { id: '1', name: 'راتب',     icon: 'briefcase',        color: '#10b981' },
  { id: '2', name: 'عمل حر',  icon: 'laptop',           color: '#3b82f6' },
  { id: '3', name: 'هدية',    icon: 'gift',             color: '#ec4899' },
  { id: '4', name: 'مكافأة',  icon: 'sparkles',         color: '#eab308' },
  { id: '5', name: 'استثمار', icon: 'bar-chart-2',      color: '#a855f7' },
  { id: '6', name: 'أخرى',   icon: 'more-horizontal',   color: '#64748b' },
];

const MONTH_NAMES_AR = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
];

interface DashboardProps {
  onOpenAI?: () => void;
  onOpenNotifications?: () => void;
  onRequireUpgrade?: () => void;
  onNavigate?: (tab: TabType) => void;
}

export function Dashboard({ onOpenNotifications, onNavigate }: DashboardProps) {
  const { transactions, deleteTransaction, balance, user, notifications } = useApp();
  const [search, setSearch] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  const sym = user?.currency || 'EGP';
  const filtered = transactions.filter(tx => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return tx.description.toLowerCase().includes(s) || tx.category.toLowerCase().includes(s);
  });
  const recentTx = filtered.slice(0, 15);

  const formatNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatDate = (d: string) => {
    const date = new Date(d);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  const getCatColor = (name: string) => {
    const all = [...expenseCategories, ...incomeCategories];
    return all.find(c => c.name === name)?.color || '#64748b';
  };
  const getCatIcon = (name: string): React.ElementType => {
    const all = [...expenseCategories, ...incomeCategories];
    const cat = all.find(c => c.name === name);
    return iconMap[cat?.icon || 'more-horizontal'] || MoreHorizontal;
  };

  const now = new Date();
  const monthName = MONTH_NAMES_AR[now.getMonth()];

  return (
    <div className="flex flex-col h-full pb-24" style={{ background: BG_DEEP }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: BG_CARD }}
          >
            <Bell size={20} style={{ color: '#a0b8bc' }} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0b1315]" />
            )}
          </button>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: '#6a9ca2' }}>صباح الخير</p>
          <h1 className="text-white font-bold text-lg leading-tight">
            محفظة {user?.name || 'حسبوبة'}
          </h1>
        </div>
      </div>

      {/* ── Hero Balance Card ─────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(145deg, #162a2f 0%, #0f1d20 100%)`,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
            style={{ background: ACCENT }}
          />
          <div
            className="absolute -bottom-5 -right-5 w-32 h-32 rounded-full opacity-8 blur-2xl"
            style={{ background: '#008891' }}
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {showBalance
                ? <Eye size={16} style={{ color: '#6a9ca2' }} />
                : <EyeOff size={16} style={{ color: '#6a9ca2' }} />}
            </button>
            <div className="text-right">
              <p className="text-xs font-medium" style={{ color: '#6a9ca2' }}>
                إجمالي الإنفاق · {monthName}
              </p>
            </div>
          </div>

          <div className="text-right relative z-10 mb-4">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-sm font-bold" style={{ color: '#6a9ca2' }}>{sym}</span>
              <span className="text-white font-black" style={{ fontSize: 38, lineHeight: 1, letterSpacing: '-1px' }}>
                {showBalance ? formatNum(balance.current) : '••••••'}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#4a7a80' }}>
              {transactions.length} معاملة · {sym} {formatNum(balance.income / Math.max(transactions.length || 1, 1))} / معاملة
            </p>
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <TrendingDown size={10} style={{ color: '#10b981' }} />
                </div>
                <span className="text-[10px]" style={{ color: '#6a9ca2' }}>الدخل</span>
              </div>
              <p className="font-black text-sm" style={{ color: '#34d399' }}>
                +{formatNum(balance.income)}
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.2)' }}>
                  <TrendingUp size={10} style={{ color: '#f43f5e' }} />
                </div>
                <span className="text-[10px]" style={{ color: '#6a9ca2' }}>المصاريف</span>
              </div>
              <p className="font-black text-sm" style={{ color: '#fb7185' }}>
                -{formatNum(balance.expenses)}
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,173,181,0.2)' }}>
                  <Wallet size={10} style={{ color: ACCENT }} />
                </div>
                <span className="text-[10px]" style={{ color: '#6a9ca2' }}>الصافي</span>
              </div>
              <p className="font-black text-sm" style={{ color: balance.current >= 0 ? '#00adb5' : '#fb7185' }}>
                {formatNum(Math.abs(balance.current))}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Actions Row ─────────────────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="flex justify-around">
          {[
            { label: 'إضافة',      icon: Plus,       action: () => onNavigate?.('social') }, // 'social' tab is used for Add Modal triggers globally now.
            { label: 'المشاريع',   icon: Briefcase,  action: () => onNavigate?.('business') },
            { label: 'التحويش',    icon: Users,      action: () => onNavigate?.('analytics') }, // Jars/Social are linked inside Analytics
            { label: 'حسابي',      icon: User,       action: () => onNavigate?.('analytics') },
          ].map((btn, i) => {
            const Ico = btn.icon;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={btn.action}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
                >
                  <Ico size={22} style={{ color: ACCENT }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: '#6a9ca2' }}>{btn.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#4a7a80' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث في المعاملات..."
            className="w-full rounded-xl py-3 pr-11 pl-4 text-sm placeholder-[#4a7a80] focus:outline-none text-right"
            style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }}
          />
        </div>
      </div>

      {/* ── Recent Transactions ───────────────────────────────────────────────── */}
      <div className="px-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <button className="text-xs font-bold" style={{ color: ACCENT }}>عرض الكل</button>
          <h3 className="text-white font-bold text-base">أحدث المعاملات</h3>
        </div>

        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
            >
              <Receipt size={32} style={{ color: '#2d4a50' }} />
            </div>
            <p className="font-bold text-base" style={{ color: '#6a9ca2' }}>لا معاملات بعد</p>
            <p className="text-sm mt-1" style={{ color: '#3a6068' }}>
              ستظهر معاملاتك هنا بعد إضافة حساب أو إدخال معاملة يدوياً.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentTx.map((tx, i) => {
              const Icon  = getCatIcon(tx.category);
              const color = getCatColor(tx.category);
              const isIncome = tx.type === 'income';
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center"
                    >
                      <Trash2 size={12} style={{ color: '#f43f5e' }} />
                    </button>
                    <div className="text-left" style={{ direction: 'ltr' }}>
                      <p className="font-bold text-sm" style={{ color: isIncome ? '#34d399' : '#fb7185' }}>
                        {isIncome ? '+' : '-'}{formatNum(tx.amount)} {sym}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#4a7a80' }}>{formatDate(tx.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{tx.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#4a7a80' }}>{tx.category}</p>
                    </div>
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: color + '18', border: `1.5px solid ${color}30` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
