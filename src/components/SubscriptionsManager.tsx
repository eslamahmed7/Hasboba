import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, X, Calendar, AlertCircle, TrendingUp, RefreshCw, Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubscriptionModal } from './SubscriptionModal';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

const predefinedSubscriptions = [
  { label: 'Netflix', icon: '🍿', color: '#E50914', price: 150 },
  { label: 'Spotify', icon: '🎵', color: '#1DB954', price: 60 },
  { label: 'Anghami', icon: '🎧', color: '#8A2BE2', price: 50 },
  { label: 'OSN+', icon: '📺', color: '#E50914', price: 160 },
  { label: 'Shahid', icon: '🎬', color: '#00A859', price: 100 },
  { label: 'Amazon Prime', icon: '📦', color: '#00A8E1', price: 30 },
  { label: 'iCloud+', icon: '☁️', color: '#0070c9', price: 30 },
  { label: 'Google One', icon: '💾', color: '#4285F4', price: 30 },
  { label: 'YouTube Premium', icon: '▶️', color: '#FF0000', price: 60 },
  { label: 'Gym', icon: '💪', color: '#f97316', price: 500 },
  { label: 'Internet', icon: '🌐', color: '#3b82f6', price: 300 },
  { label: 'Mobile Bill', icon: '📱', color: '#a855f7', price: 150 },
];

export function SubscriptionsManager() {
  const { subscriptions, addSubscription, deleteSubscription, updateSubscription, user } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', billingCycle: 'monthly', nextBillingDate: '', icon: '🔄', color: ACCENT });
  
  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  const handleAdd = () => {
    if (!newSub.name || !newSub.amount || !newSub.nextBillingDate) return;
    addSubscription({
      name: newSub.name,
      amount: parseFloat(newSub.amount),
      billingCycle: newSub.billingCycle as any,
      nextBillingDate: newSub.nextBillingDate,
      icon: newSub.icon,
      color: newSub.color,
      status: 'active'
    });
    setShowAddModal(false);
    setNewSub({ name: '', amount: '', billingCycle: 'monthly', nextBillingDate: '', icon: '🔄', color: ACCENT });
  };

  const totalMonthly = subscriptions.reduce((s, sub) => {
    if (sub.status !== 'active') return s;
    return s + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount);
  }, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28">
      
      {/* Overview Card */}
      <div className="px-4 mb-4 mt-2">
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${BG_CARD} 0%, #0f1d20 100%)`, border: `1px solid ${BORDER}` }}>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl" style={{ background: ACCENT }} />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <button onClick={() => setShowCardModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{ background: `rgba(0,173,181,0.1)`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
              <CreditCard size={14} /> بطاقة افتراضية الدفع
            </button>
            <h3 className="text-white font-bold text-sm">إجمالي الاشتراكات</h3>
          </div>
          <div className="text-right relative z-10">
            <p className="font-black text-3xl" style={{ color: ACCENT }}>{fmt(totalMonthly)}</p>
            <p className="text-xs mt-1" style={{ color: '#4a7a80' }}>{sym} / شهرياً (تقريباً)</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <button onClick={() => setShowAddModal(true)}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
          style={{ border: `1.5px dashed ${ACCENT}40`, background: `rgba(0,173,181,0.05)`, color: ACCENT }}>
          <Plus size={18} /> إضافة اشتراك جديد
        </button>
      </div>

      <div className="px-4">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '24px' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: BG_BASE }}>
              <RefreshCw size={24} style={{ color: '#2d4a50' }} />
            </div>
            <p className="font-bold text-base" style={{ color: '#6a9ca2' }}>لا توجد اشتراكات</p>
            <p className="text-sm mt-1" style={{ color: '#3a6068' }}>أضف اشتراكاتك لتتبعها وإدارتها</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((sub, i) => {
              const due = new Date(sub.nextBillingDate);
              const daysLeft = Math.ceil((due.getTime() - new Date().getTime()) / 86400000);
              const isActive = sub.status === 'active';
              return (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-[20px] transition-colors"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}`, opacity: isActive ? 1 : 0.6 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => deleteSubscription(sub.id)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.1)' }}>
                        <Trash2 size={12} style={{ color: '#f43f5e' }} />
                      </button>
                      <button onClick={() => updateSubscription(sub.id, { status: isActive ? 'cancelled' : 'active' })}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{ background: isActive ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)', color: isActive ? '#34d399' : '#f43f5e' }}>
                        {isActive ? 'نشط' : 'ملغى'}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{sub.name}</p>
                        <p className="text-[10px]" style={{ color: '#4a7a80' }}>
                          {sub.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: sub.color + '20' }}>
                        {sub.icon}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: !isActive ? 'rgba(107,114,128,0.1)' : daysLeft <= 3 ? 'rgba(244,63,94,0.1)' : daysLeft <= 7 ? 'rgba(250,204,21,0.1)' : 'rgba(0,173,181,0.1)',
                        color: !isActive ? '#9ca3af' : daysLeft <= 3 ? '#f43f5e' : daysLeft <= 7 ? '#facc15' : ACCENT
                      }}>
                      {!isActive ? 'مُلغى' : daysLeft < 0 ? 'متأخر الدفع' : daysLeft === 0 ? 'يستحق اليوم' : `باقي ${daysLeft} يوم`}
                    </div>
                    <p className="font-black text-base" style={{ color: 'white' }}>
                      {fmt(sub.amount)} <span className="text-xs font-normal" style={{ color: '#4a7a80' }}>{sym}</span>
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}>
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">اشتراك جديد</h3>
                  <div className="w-9" />
                </div>

                <p className="text-xs mb-3 text-right font-medium" style={{ color: '#6a9ca2' }}>قوالب جاهزة</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4" style={{ direction: 'rtl' }}>
                  {predefinedSubscriptions.map(data => (
                    <button key={data.label}
                      onClick={() => setNewSub({ ...newSub, name: data.label, icon: data.icon, color: data.color, amount: data.price.toString() })}
                      className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                      style={{
                        background: newSub.name === data.label ? `rgba(0,173,181,0.1)` : BG_CARD,
                        border: `1px solid ${newSub.name === data.label ? ACCENT : BORDER}`,
                        color: newSub.name === data.label ? ACCENT : '#4a7a80'
                      }}>
                      <span className="text-lg">{data.icon}</span>
                      <span className="text-sm font-bold whitespace-nowrap">{data.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>اسم الاشتراك</p>
                  <input value={newSub.name} onChange={e => setNewSub({ ...newSub, name: e.target.value })} placeholder="مثال: Netflix"
                    className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                    style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                </div>

                <div className="mb-4">
                  <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>المبلغ</p>
                  <input value={newSub.amount} onChange={e => setNewSub({ ...newSub, amount: e.target.value })} type="number" placeholder="0.00"
                    className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                    style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>دورة الفوترة</p>
                    <div className="flex gap-2 p-1 rounded-xl" style={{ background: BG_CARD }}>
                      {[
                        { id: 'monthly', label: 'شهري' },
                        { id: 'yearly', label: 'سنوي' }
                      ].map(cycle => (
                        <button key={cycle.id} onClick={() => setNewSub({ ...newSub, billingCycle: cycle.id })}
                          className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                          style={{
                            background: newSub.billingCycle === cycle.id ? ACCENT : 'transparent',
                            color: newSub.billingCycle === cycle.id ? 'white' : '#4a7a80'
                          }}>
                          {cycle.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>تاريخ الدفع القادم</p>
                    <input type="date" value={newSub.nextBillingDate} onChange={e => setNewSub({ ...newSub, nextBillingDate: e.target.value })}
                      className="w-full rounded-xl py-3 px-3 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  </div>
                </div>

                <button onClick={handleAdd} disabled={!newSub.name || !newSub.amount || !newSub.nextBillingDate}
                  className="w-full py-4 rounded-2xl font-bold text-base mt-2 transition-all"
                  style={{
                    background: newSub.name && newSub.amount && newSub.nextBillingDate ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)` : BG_CARD,
                    color: newSub.name && newSub.amount && newSub.nextBillingDate ? 'white' : '#3a6068',
                    boxShadow: newSub.name && newSub.amount && newSub.nextBillingDate ? `0 4px 20px rgba(0,173,181,0.3)` : 'none'
                  }}>
                  حفظ الاشتراك
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCardModal && <SubscriptionModal onClose={() => setShowCardModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
