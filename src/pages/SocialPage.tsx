import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Phone, CheckCircle, Trash2,
  Target, Star, Trophy, Users2, TrendingUp, PiggyBank
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

const tierColors: Record<string, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2',
};

export function SocialPage() {
  const {
    debts, addDebt, updateDebt, deleteDebt,
    savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    achievements, user,
  } = useApp();

  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  const [section, setSection] = useState<'savings' | 'debts'>('savings');

  // ── Debt state ────────────────────────────────────────────────────────────────
  type DebtTabType = 'owed' | 'owe';
  const [debtTab, setDebtTab] = useState<DebtTabType>('owed');
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [newDebt, setNewDebt] = useState({ contactName: '', phone: '', amount: '', dueDate: '', type: 'owed' as DebtTabType, notes: '' });

  const filteredDebts = debts.filter(d => d.type === debtTab && !d.isPaid);
  const paidDebts     = debts.filter(d => d.type === debtTab && d.isPaid);
  const totalOwed = debts.filter(d => d.type === 'owed' && !d.isPaid).reduce((s, d) => s + d.amount, 0);
  const totalOwe  = debts.filter(d => d.type === 'owe'  && !d.isPaid).reduce((s, d) => s + d.amount, 0);

  const handleAddDebt = () => {
    if (!newDebt.contactName || !newDebt.amount || !newDebt.dueDate) return;
    addDebt({ ...newDebt, amount: parseFloat(newDebt.amount), isPaid: false });
    setNewDebt({ contactName: '', phone: '', amount: '', dueDate: '', type: 'owed', notes: '' });
    setShowDebtModal(false);
  };

  // ── Savings state ──────────────────────────────────────────────────────────────
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddFunds, setShowAddFunds]   = useState<string | null>(null);
  const [fundAmount, setFundAmount]       = useState('');
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: ACCENT });
  const goalIcons = ['🎯', '💻', '✈️', '🏠', '🚗', '💍', '📱', '🎓', '💰', '🏦'];

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    addSavingsGoal({ name: newGoal.name, targetAmount: parseFloat(newGoal.targetAmount), currentAmount: 0, icon: newGoal.icon, color: newGoal.color, deadline: newGoal.deadline });
    setNewGoal({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: ACCENT });
    setShowGoalModal(false);
  };

  const handleAddFunds = (goalId: string) => {
    if (!fundAmount) return;
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) updateSavingsGoal(goalId, { currentAmount: goal.currentAmount + parseFloat(fundAmount) });
    setFundAmount(''); setShowAddFunds(null);
  };

  const earnedAch = achievements.filter(a => a.earned);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28" style={{ background: BG_BASE }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-white font-bold text-xl text-right">التحويش والشراكة</h1>
        <p className="text-xs mt-0.5 text-right" style={{ color: '#6a9ca2' }}>أهداف الادخار، السلف والمستلف</p>
      </div>

      {/* ── Summary Row ─────────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(145deg, #162a2f 0%, #0f1d20 100%)`, border: `1px solid ${BORDER}` }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-3xl" style={{ background: ACCENT }} />
          <div className="flex gap-3 relative z-10">
            <div className="flex-1 rounded-2xl p-3 text-right" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#6a9ca2' }}>المُدَّخر</p>
              <p className="font-black text-sm" style={{ color: ACCENT }}>
                {fmt(savingsGoals.reduce((s, g) => s + g.currentAmount, 0))}
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-3 text-right" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#6a9ca2' }}>ناس مسلّفاهم</p>
              <p className="font-black text-sm" style={{ color: '#34d399' }}>{fmt(totalOwed)}</p>
            </div>
            <div className="flex-1 rounded-2xl p-3 text-right" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#6a9ca2' }}>أنا مستلّف</p>
              <p className="font-black text-sm" style={{ color: '#fb7185' }}>{fmt(totalOwe)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 rounded-2xl p-1.5" style={{ background: BG_CARD }}>
          {[
            { id: 'savings', label: 'التحويش والإنجازات', icon: PiggyBank },
            { id: 'debts',   label: 'السلف والمستلف',    icon: Users2  },
          ].map(s => {
            const Icon = s.icon;
            const isActive = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id as any)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: isActive ? ACCENT : 'transparent',
                  color: isActive ? 'white' : '#4a7a80',
                  boxShadow: isActive ? `0 0 12px rgba(0,173,181,0.3)` : 'none',
                }}>
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Savings Section ──────────────────────────────────────────────────── */}
      {section === 'savings' && (
        <div className="px-4">
          {/* Achievements strip */}
          {earnedAch.length > 0 && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-3">
                <button className="text-xs font-bold" style={{ color: ACCENT }}>عرض الكل</button>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Trophy size={14} style={{ color: '#ffd700' }} /> الإنجازات المكتسبة
                </h3>
              </div>
              <div className="flex gap-4">
                {earnedAch.slice(0, 3).map(ach => (
                  <div key={ach.id} className="flex flex-col items-center gap-1.5">
                    <div className="w-11 h-11 relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-[12px] rotate-45 border"
                        style={{ background: tierColors[ach.tier] + '15', borderColor: tierColors[ach.tier] + '40' }} />
                      <Star size={18} style={{ color: tierColors[ach.tier] }} fill={tierColors[ach.tier]} className="z-10" />
                    </div>
                    <span className="text-white text-[10px] font-bold text-center max-w-[48px] leading-tight">{ach.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add goal button */}
          <button onClick={() => setShowGoalModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold"
            style={{ border: `1.5px dashed ${ACCENT}40`, background: `rgba(0,173,181,0.05)`, color: ACCENT }}>
            <Plus size={18} /> هدف ادخار جديد
          </button>

          {savingsGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <Target size={32} style={{ color: '#2d4a50' }} />
              </div>
              <p className="font-bold text-base" style={{ color: '#6a9ca2' }}>ابدأ التحويش</p>
              <p className="text-sm mt-1" style={{ color: '#3a6068' }}>حدد هدفك وابدأ الادخار خطوة بخطوة</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savingsGoals.map((goal, i) => {
                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const isComplete = pct >= 100;
                return (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-[22px] p-5" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => deleteSavingsGoal(goal.id)}>
                        <Trash2 size={15} style={{ color: '#3a6068' }} />
                      </button>
                      <h3 className="text-white font-bold text-base flex items-center gap-2">
                        {goal.name} <span>{goal.icon}</span>
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: isComplete ? '#34d399' : '#6a9ca2' }}>
                        {Math.round(pct)}%{isComplete ? ' ✓' : ''}
                      </span>
                      <div className="text-right" style={{ direction: 'ltr' }}>
                        <span className="font-bold text-sm" style={{ color: ACCENT }}>{fmt(goal.currentAmount)}</span>
                        <span className="text-xs" style={{ color: '#4a7a80' }}> / {fmt(goal.targetAmount)} {sym}</span>
                      </div>
                    </div>

                    <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: '#0b1315' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: isComplete ? '#34d399' : goal.color }} />
                    </div>

                    {goal.deadline && (
                      <p className="text-xs text-right mb-2" style={{ color: '#4a7a80' }}>
                        حتى: {new Date(goal.deadline).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <button onClick={() => setShowAddFunds(showAddFunds === goal.id ? null : goal.id)}
                        className="text-xs font-bold" style={{ color: ACCENT }}>
                        إيداع مبلغ
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddFunds === goal.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
                          <div className="flex gap-2">
                            <button onClick={() => setShowAddFunds(null)}
                              className="px-3 py-2 rounded-xl text-sm"
                              style={{ background: BG_BASE, color: '#6a9ca2' }}>
                              إلغاء
                            </button>
                            <button onClick={() => handleAddFunds(goal.id)}
                              className="flex-1 py-2 rounded-xl text-sm font-bold"
                              style={{ background: ACCENT, color: 'white' }}>
                              تأكيد
                            </button>
                            <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                              placeholder="المبلغ"
                              className="flex-1 rounded-xl px-3 py-2 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                              style={{ background: BG_BASE, border: `1px solid ${BORDER}`, color: 'white' }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Debts Section ──────────────────────────────────────────────────────── */}
      {section === 'debts' && (
        <div className="px-4">
          {/* Sub tabs */}
          <div className="flex gap-2 rounded-2xl p-1.5 mb-4" style={{ background: BG_CARD }}>
            {[{ id: 'owed', label: '🤝 مسلّفتهم' }, { id: 'owe', label: '💸 مستلّف' }].map(t => (
              <button key={t.id} onClick={() => setDebtTab(t.id as DebtTabType)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: debtTab === t.id ? ACCENT : 'transparent',
                  color: debtTab === t.id ? 'white' : '#4a7a80',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button onClick={() => { setNewDebt(d => ({ ...d, type: debtTab })); setShowDebtModal(true); }}
            className="w-full mb-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold"
            style={{ border: `1.5px dashed ${ACCENT}40`, background: `rgba(0,173,181,0.05)`, color: ACCENT }}>
            <Plus size={18} />
            {debtTab === 'owed' ? 'إضافة شخص سلّفته' : 'إضافة مبلغ استلّفته'}
          </button>

          {filteredDebts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3"
                style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <Users2 size={28} style={{ color: '#2d4a50' }} />
              </div>
              <p className="text-sm" style={{ color: '#4a7a80' }}>
                {debtTab === 'owed' ? 'ما سلّفتش حد' : 'مش مستلّف من حد'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {filteredDebts.map((debt, i) => {
                const due = new Date(debt.dueDate);
                const daysLeft = Math.ceil((due.getTime() - new Date().getTime()) / 86400000);
                const isOverdue = daysLeft < 0;
                return (
                  <motion.div key={debt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteDebt(debt.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(244,63,94,0.1)' }}>
                          <Trash2 size={12} style={{ color: '#f43f5e' }} />
                        </button>
                        <button onClick={() => updateDebt(debt.id, { isPaid: true })}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(52,211,153,0.1)' }}>
                          <CheckCircle size={12} style={{ color: '#34d399' }} />
                        </button>
                        {debt.phone && (
                          <a href={`tel:${debt.phone}`}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(96,165,250,0.1)' }}>
                            <Phone size={12} style={{ color: '#60a5fa' }} />
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{debt.contactName}</p>
                        {debt.notes && <p className="text-[10px]" style={{ color: '#4a7a80' }}>{debt.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: isOverdue ? 'rgba(244,63,94,0.1)' : daysLeft <= 3 ? 'rgba(250,204,21,0.1)' : 'rgba(0,173,181,0.1)',
                          color: isOverdue ? '#f43f5e' : daysLeft <= 3 ? '#fbbf24' : ACCENT,
                        }}>
                        {isOverdue ? `متأخر ${Math.abs(daysLeft)} يوم` : `باقي ${daysLeft} يوم`}
                      </div>
                      <p className="font-black text-lg" style={{ color: debt.type === 'owed' ? '#34d399' : '#fb7185' }}>
                        {fmt(debt.amount)} <span className="text-xs font-normal" style={{ color: '#4a7a80' }}>{sym}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Paid debts */}
          {paidDebts.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-3 text-right" style={{ color: '#3a6068' }}>✓ مسدّد</p>
              {paidDebts.map(debt => (
                <div key={debt.id} className="flex items-center justify-between py-2 px-3 mb-2 rounded-xl opacity-50"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <span className="text-xs line-through" style={{ color: '#4a7a80' }}>{fmt(debt.amount)} {sym}</span>
                  <span className="text-xs" style={{ color: '#4a7a80' }}>{debt.contactName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Goal Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGoalModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowGoalModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}>
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowGoalModal(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">هدف ادخار جديد</h3>
                  <div className="w-9" />
                </div>

                <div className="flex gap-3 flex-wrap mb-5 justify-end">
                  {goalIcons.map(icon => (
                    <button key={icon} onClick={() => setNewGoal(g => ({ ...g, icon }))}
                      className="w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all"
                      style={{
                        background: newGoal.icon === icon ? `rgba(0,173,181,0.15)` : BG_CARD,
                        border: `1.5px solid ${newGoal.icon === icon ? ACCENT : BORDER}`,
                      }}>
                      {icon}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'name',         label: 'اسم الهدف',       placeholder: 'مثال: شنطة سفر' },
                  { key: 'targetAmount', label: 'المبلغ المطلوب',   placeholder: '0.00' },
                  { key: 'deadline',     label: 'الموعد المستهدف',  placeholder: '' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>{f.label}</p>
                    <input type={f.key === 'deadline' ? 'date' : f.key === 'name' ? 'text' : 'number'}
                      value={(newGoal as any)[f.key]}
                      onChange={e => setNewGoal(g => ({ ...g, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl py-4 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  </div>
                ))}

                <button onClick={handleAddGoal} disabled={!newGoal.name || !newGoal.targetAmount}
                  className="w-full py-4 rounded-2xl font-bold text-base mt-2 transition-all"
                  style={{
                    background: newGoal.name && newGoal.targetAmount
                      ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`
                      : BG_CARD,
                    color: newGoal.name && newGoal.targetAmount ? 'white' : '#3a6068',
                    boxShadow: newGoal.name && newGoal.targetAmount ? `0 4px 20px rgba(0,173,181,0.3)` : 'none',
                  }}>
                  حفظ الهدف
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Debt Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDebtModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDebtModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}>
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setShowDebtModal(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">
                    {newDebt.type === 'owed' ? 'سلّفت حد' : 'استلّفت من حد'}
                  </h3>
                  <div className="w-9" />
                </div>

                <div className="flex gap-2 rounded-2xl p-1.5 mb-5" style={{ background: BG_CARD }}>
                  {[{ id: 'owed', label: '🤝 سلّفت' }, { id: 'owe', label: '💸 استلّفت' }].map(t => (
                    <button key={t.id} onClick={() => setNewDebt(d => ({ ...d, type: t.id as DebtTabType }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: newDebt.type === t.id ? ACCENT : 'transparent',
                        color: newDebt.type === t.id ? 'white' : '#4a7a80',
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'contactName', label: 'الاسم',                   type: 'text', placeholder: newDebt.type === 'owed' ? 'الشخص اللي سلّفته' : 'الشخص اللي استلّفت منه' },
                  { key: 'phone',       label: 'التليفون (اختياري)',       type: 'tel',  placeholder: '01xxxxxxxxx' },
                  { key: 'amount',      label: 'المبلغ',                   type: 'number', placeholder: '0.00' },
                  { key: 'dueDate',     label: 'تاريخ الاستحقاق',         type: 'date', placeholder: '' },
                  { key: 'notes',       label: 'ملاحظة (اختياري)',         type: 'text', placeholder: 'مثال: لغاية آخر الشهر' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>{f.label}</p>
                    <input type={f.type} value={(newDebt as any)[f.key]}
                      onChange={e => setNewDebt(d => ({ ...d, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl py-4 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  </div>
                ))}

                <button onClick={handleAddDebt} disabled={!newDebt.contactName || !newDebt.amount || !newDebt.dueDate}
                  className="w-full py-4 rounded-2xl font-bold text-base mt-2 transition-all"
                  style={{
                    background: newDebt.contactName && newDebt.amount && newDebt.dueDate
                      ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`
                      : BG_CARD,
                    color: newDebt.contactName && newDebt.amount && newDebt.dueDate ? 'white' : '#3a6068',
                  }}>
                  حفظ
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
