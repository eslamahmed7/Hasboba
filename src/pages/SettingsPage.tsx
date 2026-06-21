import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, ChevronLeft, RefreshCw, Moon, Sun, Bell,
  Shield, Info, CreditCard, Globe, Calendar, Sparkles, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { SubscriptionsManager } from '../components/SubscriptionsManager';

type ActiveSection = 'main' | 'subscriptions' | 'profile';

interface Props {
  onOpenNotifications?: () => void;
  onOpenAdmin?: () => void;
}

export function SettingsPage({ onOpenNotifications, onOpenAdmin }: Props) {
  const { user, setUser, isDark, toggleTheme, notifications } = useApp();
  const [activeSection, setActiveSection] = useState<ActiveSection | 'aiPreferences'>('main');
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
    if (user) {
      setUser({ ...user, name: editName, payday: editPayday });
      setActiveSection('main');
    }
  };

  const toggleAdminStatus = async () => {
    if (!user) return;
    const newAdminStatus = !user.isAdmin;
    try {
      const { error } = await supabase.from('profiles').update({ is_admin: newAdminStatus }).eq('id', user.id);
      if (error) throw error;
      setUser({ ...user, isAdmin: newAdminStatus });
    } catch (err) {
      console.error('Failed to toggle admin status:', err);
      setUser({ ...user, isAdmin: newAdminStatus });
    }
  };

  if (activeSection === 'subscriptions') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-[#1f2937]">
          <button onClick={() => setActiveSection('main')} className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center">
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-white font-bold text-lg">الاشتراكات</h1>
          <div className="w-8" />
        </div>
        <div className="flex-1 overflow-hidden">
          <SubscriptionsManager />
        </div>
      </div>
    );
  }

  if (activeSection === 'profile') {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-6">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">الملف الشخصي</h1>
          <button onClick={() => setActiveSection('main')} className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center">
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5 flex flex-col gap-6 mt-4">
          <div>
            <p className="text-gray-400 text-xs mb-2 text-right font-medium">الاسم</p>
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right focus:outline-none focus:border-[#4ade80]/40"
            />
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-2 text-right font-medium">البريد الإلكتروني</p>
            <input
              value={user?.email || ''}
              disabled
              className="w-full bg-[#0b1120] border border-[#1f2937] rounded-xl py-3.5 px-4 text-gray-500 text-right opacity-70"
            />
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-3 text-right font-medium">يوم الراتب (دورة الفوترة)</p>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <button
                  key={d}
                  onClick={() => setEditPayday(d)}
                  className={`aspect-square rounded-xl text-sm font-bold transition-all ${
                    editPayday === d ? 'bg-[#4ade80] text-[#070a10] shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'bg-[#111827] text-gray-400 border border-[#1f2937]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveProfile} className="w-full py-4 rounded-2xl bg-[#4ade80] text-[#070a10] font-bold text-lg mt-4 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
            حفظ التغييرات
          </button>
        </div>
      </div>
    );
  }

  if (activeSection === 'aiPreferences') {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-6">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-[#1f2937]">
          <h1 className="text-white font-bold text-xl">تفضيلات الذكاء الاصطناعي</h1>
          <button onClick={() => setActiveSection('main')} className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center">
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5 flex flex-col gap-6 mt-6">
          {/* Tone */}
          <div>
            <p className="text-white font-bold mb-2 text-right">شخصية المستشار المالي</p>
            <p className="text-gray-500 text-xs mb-4 text-right">اختر أسلوب المحادثة الذي تفضله عند التحدث مع المستشار الذكي.</p>
            
            <div className="flex flex-col gap-3">
              {[
                { id: 'friendly', name: 'ودود ومشجع', icon: '😊' },
                { id: 'professional', name: 'احترافي ورسمي', icon: '💼' },
                { id: 'strict', name: 'صارم ومباشر', icon: '🎯' },
              ].map(tone => (
                <button
                  key={tone.id}
                  onClick={() => user && setUser({ ...user, aiTone: tone.id as any })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    (user?.aiTone || 'friendly') === tone.id ? 'bg-[#4ade80]/10 border-[#4ade80] text-white' : 'bg-[#111827] border-[#1f2937] text-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${(user?.aiTone || 'friendly') === tone.id ? 'border-[#4ade80]' : 'border-gray-500'}`}>
                    {(user?.aiTone || 'friendly') === tone.id && <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-full" />}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-bold text-sm">{tone.name}</span>
                    <span className="text-xl">{tone.icon}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#1f2937]/50 my-2" />

          {/* Detail Level */}
          <div>
            <p className="text-white font-bold mb-2 text-right">مستوى التفاصيل</p>
            <p className="text-gray-500 text-xs mb-4 text-right">هل تفضل إجابات قصيرة ومباشرة أم تفصيلية وشاملة؟</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => user && setUser({ ...user, aiDetailLevel: 'brief' })}
                className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  (user?.aiDetailLevel || 'brief') === 'brief' ? 'bg-[#4ade80]/10 border-[#4ade80] text-white' : 'bg-[#111827] border-[#1f2937] text-gray-400'
                }`}
              >
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-sm">مختصرة</span>
              </button>
              <button
                onClick={() => user && setUser({ ...user, aiDetailLevel: 'detailed' })}
                className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  (user?.aiDetailLevel || 'brief') === 'detailed' ? 'bg-[#4ade80]/10 border-[#4ade80] text-white' : 'bg-[#111827] border-[#1f2937] text-gray-400'
                }`}
              >
                <span className="text-2xl">📚</span>
                <span className="font-bold text-sm">مفصلة</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Main settings items like the image
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">الإعدادات</h1>
        <button onClick={onOpenNotifications} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors relative">
          {notifications.filter(n => !n.isRead).length > 0 && (
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-2 right-2 border-2 border-[#070a10]" />
          )}
          <Bell size={24} className="text-white" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-right flex-1">
            <p className="text-white font-bold text-lg mb-0.5">{user?.name || 'مستخدم حسبوبة'}</p>
            <p className="text-gray-500 text-sm">{user?.email || 'email@example.com'}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4ade80]/30 to-[#0ea5e9]/30 border-2 border-[#4ade80]/40 flex items-center justify-center overflow-hidden shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}&backgroundColor=transparent`} alt="avatar" className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-5 flex flex-col">
        
        {/* Profile Item */}
        <button onClick={() => setActiveSection('profile')} className="w-full flex items-center justify-between py-4 group">
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">الملف الشخصي</span>
            <User size={20} className="text-gray-400" />
          </div>
        </button>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Billing Cycle */}
        <div className="w-full flex items-center justify-between py-4">
          <span className="text-gray-500 text-xs">يوم {user?.payday || 25}</span>
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">دورة الفوترة (يوم الراتب)</span>
            <Calendar size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Currency */}
        <button onClick={() => setShowCurrencyModal(true)} className="w-full flex items-center justify-between py-4 group hover:bg-white/5 transition-colors">
          <span className="text-gray-500 text-xs" style={{direction: 'ltr'}}>{user?.currency || 'EGP'}</span>
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">تغيير العملة</span>
            <Globe size={20} className="text-gray-400" />
          </div>
        </button>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Theme */}
        <div className="w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${isDark ? 'bg-[#4ade80]' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-[#0b1120] rounded-full absolute top-0.5 transition-all ${isDark ? 'right-0.5' : 'left-0.5'}`} />
            </div>
            <span className="text-gray-500 text-xs">{isDark ? 'مظلم' : 'فاتح'}</span>
            <Moon size={14} className="text-gray-500" />
          </div>
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">المظهر</span>
            <Sun size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Cloud Sync */}
        <div className="w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-1.5 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] px-3 py-1 rounded-full text-xs font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            تلقائية نشطة
          </div>
          <div className="flex flex-col items-end flex-1 mr-4">
             <div className="flex items-center gap-4 text-right justify-end w-full mb-0.5">
               <span className="text-white text-sm font-medium">المزامنة السحابية</span>
               <RefreshCw size={20} className="text-gray-400 animate-[spin_8s_linear_infinite]" />
             </div>
             <span className="text-gray-500 text-[10px] mr-9">تتم المزامنة تلقائياً في الخلفية</span>
          </div>
        </div>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Subscriptions Menu */}
        <button onClick={() => setActiveSection('subscriptions')} className="w-full flex items-center justify-between py-4 group">
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">إدارة الاشتراكات</span>
            <CreditCard size={20} className="text-gray-400" />
          </div>
        </button>
        <div className="h-px bg-[#1f2937]/50" />

        {/* AI Preferences */}
        <button onClick={() => setActiveSection('aiPreferences')} className="w-full flex items-center justify-between py-4 group hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">تفضيلات الذكاء الاصطناعي</span>
            <Sparkles size={20} className="text-gray-400" />
          </div>
        </button>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Notifications */}
        <button className="w-full flex items-center justify-between py-4 group">
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">الإشعارات</span>
            <Bell size={20} className="text-gray-400" />
          </div>
        </button>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Security */}
        <button className="w-full flex items-center justify-between py-4 group">
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">الأمان</span>
            <Shield size={20} className="text-gray-400" />
          </div>
        </button>
        <div className="h-px bg-[#1f2937]/50" />

        {/* Admin Dashboard — shown only to admins */}
        {user?.isAdmin && (
          <>
            <button onClick={() => onOpenAdmin?.()} className="w-full flex items-center justify-between py-4 group bg-yellow-500/5 rounded-2xl border border-yellow-500/20 px-3 my-2">
              <ChevronLeft size={18} className="text-yellow-500/60 group-hover:text-yellow-400 transition-colors" />
              <div className="flex items-center gap-4 text-right flex-1 justify-end">
                <span className="text-yellow-400 text-sm font-bold">لوحة التحكم الإدارية 🛡️</span>
                <Shield size={20} className="text-yellow-500" />
              </div>
            </button>
            <div className="h-px bg-[#1f2937]/50" />
          </>
        )}

        {/* Admin Demo Toggle — enable/disable admin mode */}
        <div className="w-full flex items-center justify-between py-4 bg-[#1e293b]/20 px-3 rounded-2xl border border-yellow-500/20 my-2">
          <div className="flex items-center gap-3">
            <div onClick={toggleAdminStatus}
              className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${user?.isAdmin ? 'bg-yellow-500' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-[#0b1120] rounded-full absolute top-0.5 transition-all ${user?.isAdmin ? 'right-0.5' : 'left-0.5'}`} />
            </div>
            <span className="text-gray-500 text-xs">{user?.isAdmin ? 'نشط' : 'غير نشط'}</span>
          </div>
          <div className="flex flex-col items-end mr-4">
            <div className="flex items-center gap-2 text-right justify-end w-full">
              <span className="text-white text-sm font-medium">وضع الإدارة (تجريبي)</span>
              <Shield size={20} className="text-yellow-500" />
            </div>
            <span className="text-gray-500 text-[10px]">تفعيل لإظهار لوحة الإدارة 🛡️</span>
          </div>
        </div>
        <div className="h-px bg-[#1f2937]/50" />


        {/* About */}
        <button className="w-full flex items-center justify-between py-4 group">
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-white text-sm font-medium">عن حسبوبة</span>
            <Info size={20} className="text-gray-400" />
          </div>
        </button>

        {/* Logout */}
        <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center justify-between py-4 group mt-4">
          {isLoggingOut ? <Loader2 size={18} className="text-red-500 animate-spin" /> : <ChevronLeft size={18} className="text-red-500/0" />}
          <div className="flex items-center gap-4 text-right flex-1 justify-end">
            <span className="text-red-500 text-sm font-medium">تسجيل الخروج</span>
            <LogOut size={20} className="text-red-500" />
          </div>
        </button>
      </div>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={() => setShowCurrencyModal(false)}>
          <div className="bg-[#111827] border border-[#1f2937] rounded-3xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#1f2937] flex justify-between items-center">
              <button onClick={() => setShowCurrencyModal(false)} className="text-gray-400">
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
                { code: 'USD', symbol: '$', name: 'دولار أمريكي' },
                { code: 'EUR', symbol: '€', name: 'يورو' },
              ].map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    if (user) setUser({ ...user, currency: c.code, currencySymbol: c.symbol, country: c.name });
                    setShowCurrencyModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${user?.currency === c.code ? 'bg-[#4ade80]/10 border border-[#4ade80]/30' : 'hover:bg-[#1f2937]'}`}
                >
                  <span className="text-gray-500 text-sm">{c.code}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{c.name}</span>
                    <span className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center text-xs font-bold text-[#4ade80]">{c.symbol}</span>
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
