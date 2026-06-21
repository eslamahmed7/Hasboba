import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, ChevronLeft, RefreshCw, Moon, Sun, Bell,
  Shield, Info, CreditCard, Globe, Calendar, Sparkles, LogOut, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { SubscriptionsManager } from '../components/SubscriptionsManager';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

type ActiveSection = 'main' | 'subscriptions' | 'profile' | 'aiPreferences';

interface Props {
  onOpenNotifications?: () => void;
  onOpenAdmin?: () => void;
}

export function SettingsPage({ onOpenNotifications, onOpenAdmin }: Props) {
  const { user, setUser, isDark, toggleTheme, notifications } = useApp();
  const [activeSection, setActiveSection] = useState<ActiveSection>('main');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPayday, setEditPayday] = useState(user?.payday || 25);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    localStorage.clear();
    setIsLoggingOut(false);
  };

  const handleSaveProfile = () => {
    if (user) { setUser({ ...user, name: editName, payday: editPayday }); setActiveSection('main'); }
  };

  const toggleAdminStatus = async () => {
    if (!user) return;
    const newStatus = !user.isAdmin;
    try {
      const { error } = await supabase.from('profiles').update({ is_admin: newStatus }).eq('id', user.id);
      if (error) throw error;
    } catch {}
    setUser({ ...user, isAdmin: newStatus });
  };

  // ── Section: Subscriptions ─────────────────────────────────────────────────
  if (activeSection === 'subscriptions') {
    return (
      <div className="flex flex-col h-full" style={{ background: BG_BASE }}>
        <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <button onClick={() => setActiveSection('main')}
            className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
            <ChevronLeft size={20} style={{ color: '#6a9ca2' }} />
          </button>
          <h1 className="text-white font-bold text-lg">الاشتراكات</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 overflow-hidden"><SubscriptionsManager /></div>
      </div>
    );
  }

  // ── Section: Profile ───────────────────────────────────────────────────────
  if (activeSection === 'profile') {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-6" style={{ background: BG_BASE }}>
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button onClick={() => setActiveSection('main')}
            className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
            <ChevronLeft size={20} style={{ color: '#6a9ca2' }} />
          </button>
          <h1 className="text-white font-bold text-xl">الملف الشخصي</h1>
          <div className="w-9" />
        </div>

        <div className="px-5 flex flex-col gap-5 mt-2">
          <div>
            <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>الاسم</p>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
          </div>
          <div>
            <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>البريد الإلكتروني</p>
            <input value={user?.email || ''} disabled
              className="w-full rounded-xl py-3.5 px-4 text-sm text-right opacity-60"
              style={{ background: BG_MODAL, border: `1px solid ${BORDER}`, color: '#6a9ca2' }} />
          </div>
          <div>
            <p className="text-xs mb-3 text-right font-medium" style={{ color: '#6a9ca2' }}>يوم الراتب (دورة الفوترة)</p>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <button key={d} onClick={() => setEditPayday(d)}
                  className="aspect-square rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: editPayday === d ? ACCENT : BG_CARD,
                    color: editPayday === d ? 'white' : '#6a9ca2',
                    border: `1px solid ${editPayday === d ? ACCENT : BORDER}`,
                    boxShadow: editPayday === d ? `0 0 12px rgba(0,173,181,0.3)` : 'none',
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveProfile}
            className="w-full py-4 rounded-2xl font-bold text-base mt-2"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white', boxShadow: `0 4px 20px rgba(0,173,181,0.3)` }}>
            حفظ التغييرات
          </button>
        </div>
      </div>
    );
  }

  // ── Section: AI Preferences ────────────────────────────────────────────────
  if (activeSection === 'aiPreferences') {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-6" style={{ background: BG_BASE }}>
        <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <button onClick={() => setActiveSection('main')}
            className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
            <ChevronLeft size={20} style={{ color: '#6a9ca2' }} />
          </button>
          <h1 className="text-white font-bold text-xl">تفضيلات الذكاء الاصطناعي</h1>
          <div className="w-9" />
        </div>

        <div className="px-5 flex flex-col gap-6 mt-6">
          <div>
            <p className="text-white font-bold mb-1 text-right">شخصية المستشار المالي</p>
            <p className="text-xs mb-4 text-right" style={{ color: '#4a7a80' }}>اختر أسلوب المحادثة الذي تفضله.</p>
            <div className="flex flex-col gap-3">
              {[
                { id: 'friendly',     name: 'ودود ومشجع',    icon: '😊' },
                { id: 'professional', name: 'احترافي ورسمي', icon: '💼' },
                { id: 'strict',       name: 'صارم ومباشر',  icon: '🎯' },
              ].map(tone => (
                <button key={tone.id}
                  onClick={() => user && setUser({ ...user, aiTone: tone.id as any })}
                  className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{
                    background: (user?.aiTone || 'friendly') === tone.id ? `rgba(0,173,181,0.1)` : BG_CARD,
                    border: `1px solid ${(user?.aiTone || 'friendly') === tone.id ? ACCENT : BORDER}`,
                  }}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
                    style={{ borderColor: (user?.aiTone || 'friendly') === tone.id ? ACCENT : '#4a7a80' }}>
                    {(user?.aiTone || 'friendly') === tone.id &&
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT }} />}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-bold text-sm text-white">{tone.name}</span>
                    <span className="text-xl">{tone.icon}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: BORDER }} />

          <div>
            <p className="text-white font-bold mb-1 text-right">مستوى التفاصيل</p>
            <p className="text-xs mb-4 text-right" style={{ color: '#4a7a80' }}>هل تفضل إجابات قصيرة أم تفصيلية؟</p>
            <div className="flex gap-3">
              {[{ id: 'brief', icon: '⚡', label: 'مختصرة' }, { id: 'detailed', icon: '📚', label: 'مفصلة' }].map(d => (
                <button key={d.id}
                  onClick={() => user && setUser({ ...user, aiDetailLevel: d.id as any })}
                  className="flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
                  style={{
                    background: (user?.aiDetailLevel || 'brief') === d.id ? `rgba(0,173,181,0.1)` : BG_CARD,
                    border: `1px solid ${(user?.aiDetailLevel || 'brief') === d.id ? ACCENT : BORDER}`,
                    color: (user?.aiDetailLevel || 'brief') === d.id ? 'white' : '#4a7a80',
                  }}>
                  <span className="text-2xl">{d.icon}</span>
                  <span className="font-bold text-sm">{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Settings ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28" style={{ background: BG_BASE }}>

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={onOpenNotifications}
          className="w-10 h-10 rounded-full flex items-center justify-center relative"
          style={{ background: BG_CARD }}>
          {notifications.filter(n => !n.isRead).length > 0 &&
            <div className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 border border-[#0b1315]" />}
          <Bell size={20} style={{ color: '#a0b8bc' }} />
        </button>
        <h1 className="text-white font-bold text-xl">حسابي</h1>
      </div>

      {/* Profile Card */}
      <div className="px-4 mb-6">
        <div className="rounded-3xl p-5 flex items-center gap-4"
          style={{ background: `linear-gradient(145deg, ${BG_CARD} 0%, #0f1d20 100%)`, border: `1px solid ${BORDER}` }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: `rgba(0,173,181,0.15)`, border: `2px solid ${ACCENT}40` }}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}&backgroundColor=transparent`}
              alt="avatar" className="w-14 h-14" />
          </div>
          <div className="text-right flex-1">
            <p className="text-white font-bold text-lg">{user?.name || 'مستخدم حسبوبة'}</p>
            <p className="text-sm" style={{ color: '#4a7a80' }}>{user?.email || 'email@example.com'}</p>
            <div className="flex items-center gap-1 justify-end mt-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
              <span className="text-[10px] font-bold" style={{ color: ACCENT }}>
                {user?.plan === 'pro' ? 'Pro' : 'مجاني'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-4">

        {/* Group 1 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
          {[
            { label: 'الملف الشخصي', icon: User, action: () => setActiveSection('profile') },
            { label: 'دورة الفوترة (يوم الراتب)', icon: Calendar, action: null, value: `يوم ${user?.payday || 25}` },
            { label: 'تغيير العملة', icon: Globe, action: () => setShowCurrencyModal(true), value: user?.currency || 'EGP' },
            { label: 'أكواد الخصم', icon: Sparkles, action: () => alert('قريباً: إدارة أكواد الخصم هنا'), value: '' },
          ].map((item, i) => (
            <div key={i}>
              <button onClick={item.action || undefined}
                className="w-full flex items-center justify-between py-4 px-4 group transition-colors"
                style={{ cursor: item.action ? 'pointer' : 'default' }}>
                <div className="flex items-center gap-2">
                  {item.action && <ChevronLeft size={16} style={{ color: '#3a6068' }} />}
                  {item.value && <span className="text-xs" style={{ color: '#4a7a80' }}>{item.value}</span>}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-white text-sm font-medium">{item.label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `rgba(0,173,181,0.08)` }}>
                    <item.icon size={16} style={{ color: ACCENT }} />
                  </div>
                </div>
              </button>
              {i < 3 && <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />}
            </div>
          ))}
        </div>

        {/* Group 2 - App settings */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>

          {/* Theme toggle */}
          <div className="flex items-center justify-between py-4 px-4">
            <div className="flex items-center gap-3">
              <div onClick={toggleTheme}
                className="w-11 h-6 rounded-full relative cursor-pointer transition-all"
                style={{ background: isDark ? ACCENT : '#2d4a50' }}>
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                  style={{ [isDark ? 'right' : 'left']: '2px' }} />
              </div>
              <span className="text-xs" style={{ color: '#4a7a80' }}>{isDark ? 'مظلم' : 'فاتح'}</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">المظهر</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                {isDark ? <Moon size={16} style={{ color: ACCENT }} /> : <Sun size={16} style={{ color: ACCENT }} />}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />

          {/* Cloud sync */}
          <div className="flex items-center justify-between py-4 px-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: `rgba(0,173,181,0.1)`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
              تلقائية
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">المزامنة السحابية</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                <RefreshCw size={16} className="animate-[spin_8s_linear_infinite]" style={{ color: ACCENT }} />
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />

          {/* Subscriptions management */}
          <button onClick={() => setActiveSection('subscriptions')}
            className="w-full flex items-center justify-between py-4 px-4">
            <ChevronLeft size={16} style={{ color: '#3a6068' }} />
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">إدارة الاشتراكات</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                <CreditCard size={16} style={{ color: ACCENT }} />
              </div>
            </div>
          </button>
          <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />

          {/* AI Preferences */}
          <button onClick={() => setActiveSection('aiPreferences')}
            className="w-full flex items-center justify-between py-4 px-4">
            <ChevronLeft size={16} style={{ color: '#3a6068' }} />
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">تفضيلات الذكاء الاصطناعي</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                <Sparkles size={16} style={{ color: ACCENT }} />
              </div>
            </div>
          </button>
          <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />

          {/* Notifications */}
          <button className="w-full flex items-center justify-between py-4 px-4">
            <ChevronLeft size={16} style={{ color: '#3a6068' }} />
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">الإشعارات</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                <Bell size={16} style={{ color: ACCENT }} />
              </div>
            </div>
          </button>
          <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />

          {/* Security */}
          <button className="w-full flex items-center justify-between py-4 px-4">
            <ChevronLeft size={16} style={{ color: '#3a6068' }} />
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">الأمان</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                <Shield size={16} style={{ color: ACCENT }} />
              </div>
            </div>
          </button>
          <div style={{ height: 1, background: BORDER, opacity: 0.5 }} />

          {/* About */}
          <button className="w-full flex items-center justify-between py-4 px-4">
            <ChevronLeft size={16} style={{ color: '#3a6068' }} />
            <div className="flex items-center gap-3 text-right">
              <span className="text-white text-sm font-medium">عن حسبوبة</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(0,173,181,0.08)` }}>
                <Info size={16} style={{ color: ACCENT }} />
              </div>
            </div>
          </button>
        </div>

        {/* Admin group */}
        {user?.isAdmin && (
          <div className="rounded-2xl overflow-hidden mb-4"
            style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <button onClick={() => onOpenAdmin?.()}
              className="w-full flex items-center justify-between py-4 px-4">
              <ChevronLeft size={16} style={{ color: 'rgba(250,204,21,0.5)' }} />
              <div className="flex items-center gap-3 text-right">
                <span className="font-bold text-sm" style={{ color: '#facc15' }}>لوحة التحكم الإدارية 🛡️</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(250,204,21,0.1)' }}>
                  <Shield size={16} style={{ color: '#facc15' }} />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Admin toggle */}
        <div className="rounded-2xl p-4 mb-4 flex items-center justify-between"
          style={{ background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.12)' }}>
          <div className="flex items-center gap-3">
            <div onClick={toggleAdminStatus}
              className="w-11 h-6 rounded-full relative cursor-pointer transition-all"
              style={{ background: user?.isAdmin ? '#facc15' : '#2d4a50' }}>
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                style={{ [user?.isAdmin ? 'right' : 'left']: '2px' }} />
            </div>
            <span className="text-xs" style={{ color: '#4a7a80' }}>{user?.isAdmin ? 'نشط' : 'غير نشط'}</span>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">وضع الإدارة (تجريبي)</p>
            <p className="text-[10px]" style={{ color: '#3a6068' }}>تفعيل لإظهار لوحة الإدارة</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} disabled={isLoggingOut}
          className="w-full flex items-center justify-between py-4 px-4 rounded-2xl mb-4"
          style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
          {isLoggingOut
            ? <Loader2 size={18} className="animate-spin" style={{ color: '#f43f5e' }} />
            : <ChevronLeft size={16} style={{ color: 'rgba(244,63,94,0.4)' }} />}
          <div className="flex items-center gap-3 text-right">
            <span className="font-medium text-sm" style={{ color: '#f43f5e' }}>تسجيل الخروج</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(244,63,94,0.1)' }}>
              <LogOut size={16} style={{ color: '#f43f5e' }} />
            </div>
          </div>
        </button>
      </div>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCurrencyModal(false)}>
          <div className="rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ background: '#0f1d20', border: `1px solid ${BORDER}` }}
            onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <button onClick={() => setShowCurrencyModal(false)} style={{ color: '#6a9ca2' }}>
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-white font-bold text-lg">اختر العملة</h3>
              <div className="w-5" />
            </div>
            <div className="p-2">
              {[
                { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري' },
                { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
                { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
                { code: 'USD', symbol: '$',   name: 'دولار أمريكي' },
                { code: 'EUR', symbol: '€',   name: 'يورو' },
              ].map(c => (
                <button key={c.code}
                  onClick={() => { if (user) setUser({ ...user, currency: c.code, currencySymbol: c.symbol, country: c.name }); setShowCurrencyModal(false); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl transition-colors"
                  style={{
                    background: user?.currency === c.code ? `rgba(0,173,181,0.1)` : 'transparent',
                    border: user?.currency === c.code ? `1px solid ${ACCENT}30` : '1px solid transparent',
                  }}>
                  <span className="text-sm" style={{ color: '#4a7a80' }}>{c.code}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{c.name}</span>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: BG_CARD, color: ACCENT }}>
                      {c.symbol}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
