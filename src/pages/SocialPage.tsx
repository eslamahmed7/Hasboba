import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Phone, CheckCircle, Trash2,
  Target, Star, Trophy, Heart, Users2,
  TrendingUp, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';

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

  // ─── Section tabs ────────────────────────────────────────────────────────────
  const [section, setSection] = useState<'savings' | 'debts'>('savings');

  // ─── Debt state ──────────────────────────────────────────────────────────────
  type DebtTabType = 'owed' | 'owe';
  const [debtTab, setDebtTab] = useState<DebtTabType>('owed');
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [newDebt, setNewDebt] = useState({ contactName: '', phone: '', amount: '', dueDate: '', type: 'owed' as DebtTabType, notes: '' });

  const filteredDebts = debts.filter(d => d.type === debtTab && !d.isPaid);
  const paidDebts = debts.filter(d => d.type === debtTab && d.isPaid);
  const totalOwed = debts.filter(d => d.type === 'owed' && !d.isPaid).reduce((s, d) => s + d.amount, 0);
  const totalOwe = debts.filter(d => d.type === 'owe' && !d.isPaid).reduce((s, d) => s + d.amount, 0);

  const handleAddDebt = () => {
    if (!newDebt.contactName || !newDebt.amount || !newDebt.dueDate) return;
    addDebt({ ...newDebt, amount: parseFloat(newDebt.amount), isPaid: false });
    setNewDebt({ contactName: '', phone: '', amount: '', dueDate: '', type: 'owed', notes: '' });
    setShowDebtModal(false);
  };

  const formatDueDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ─── Savings state ───────────────────────────────────────────────────────────
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: '#4ade80' });
  const goalIcons = ['🎯', '💻', '✈️', '🏠', '🚗', '💍', '📱', '🎓', '💰', '🏦'];

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    addSavingsGoal({ name: newGoal.name, targetAmount: parseFloat(newGoal.targetAmount), currentAmount: 0, icon: newGoal.icon, color: newGoal.color, deadline: newGoal.deadline });
    setNewGoal({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: '#4ade80' });
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
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center">
            <Heart size={16} className="text-[#ec4899]" />
          </div>
          <h1 className="text-white font-bold text-xl">الشراكة والتحويش</h1>
        </div>
        <p className="text-gray-500 text-xs text-right">أهداف الادخار، السلف والمستلف</p>
      </div>

      {/* Section Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-1">
          {[
            { id: 'savings', label: 'التحويش والإنجازات', icon: Target },
            { id: 'debts',   label: 'السلف والمستلف',    icon: Users2 },
          ].map(s => {
            const Icon = s.icon;
            const isActive = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive ? 'bg-[#ec4899] text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]' : 'text-gray-500'
                }`}>
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Savings Section ──────────────────────────────────────────────────── */}
      {section === 'savings' && (
        <div className="px-5">
          {/* Achievements Strip */}
          {earnedAch.length > 0 && (
            <div className="bg-gradient-to-r from-[#111827] to-[#0f1729] border border-[#1f2937] rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <button className="text-[#4ade80] text-xs font-bold">عرض الكل</button>
                <h3 className="text-white font-bold text-sm flex items-center gap-2"><Trophy size={15} className="text-[#ffd700]" /> الإنجازات المكتسبة</h3>
              </div>
              <div className="flex gap-4">
                {earnedAch.slice(0, 3).map(ach => (
                  <div key={ach.id} className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-[14px] rotate-45 border" style={{ backgroundColor: tierColors[ach.tier] + '15', borderColor: tierColors[ach.tier] + '40' }} />
                      <Star size={20} style={{ color: tierColors[ach.tier] }} fill={tierColors[ach.tier]} className="z-10" />
                    </div>
                    <span className="text-white text-[10px] font-bold text-center max-w-[52px] leading-tight">{ach.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Card */}
          {savingsGoals.length > 0 && (
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[#4ade80] font-black text-xl">{fmt(savingsGoals.reduce((s, g) => s + g.currentAmount, 0))}</p>
                  <p className="text-gray-500 text-xs">{sym} ادُّخر حتى الآن</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-base">{savingsGoals.length} هدف</p>
                  <p className="text-gray-500 text-xs">من أصل {fmt(savingsGoals.reduce((s, g) => s + g.targetAmount, 0))} {sym}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Button */}
          <button onClick={() => setShowGoalModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl border border-dashed border-[#4ade80]/30 bg-[#4ade80]/5 flex items-center justify-center gap-2 text-[#4ade80] text-sm font-bold hover:bg-[#4ade80]/10 transition-all">
            <Plus size={18} /> هدف ادخار جديد
          </button>

          {/* Goals List */}
          {savingsGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#111827] border border-[#1f2937] flex items-center justify-center mb-4">
                <Target size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold text-base mb-1">ابدأ التحويش</p>
              <p className="text-gray-600 text-sm">حدد هدفك وابدأ الادخار خطوة بخطوة</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savingsGoals.map((goal, i) => {
                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const isComplete = pct >= 100;
                return (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-[#111827] border border-[#1f2937] rounded-[24px] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => deleteSavingsGoal(goal.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      <h3 className="text-white font-bold text-base flex items-center gap-2">{goal.name} <span>{goal.icon}</span></h3>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${isComplete ? 'text-[#4ade80]' : 'text-gray-400'}`}>{Math.round(pct)}%{isComplete ? ' ✓' : ''}</span>
                      <div className="text-right" style={{ direction: 'ltr' }}>
                        <span className="text-[#4ade80] font-bold text-sm">{fmt(goal.currentAmount)}</span>
                        <span className="text-gray-500 text-xs"> / {fmt(goal.targetAmount)} {sym}</span>
                      </div>
                    </div>

                    <div className="h-2.5 bg-[#1f2937] rounded-full overflow-hidden mb-3">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                        className="h-full rounded-full" style={{ backgroundColor: isComplete ? '#4ade80' : goal.color }} />
                    </div>

                    {goal.deadline && (
                      <p className="text-gray-500 text-xs text-right mb-2">حتى: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    )}

                    <div className="flex justify-end">
                      <button onClick={() => setShowAddFunds(showAddFunds === goal.id ? null : goal.id)} className="text-[#4ade80] text-xs font-bold">إيداع مبلغ</button>
                    </div>

                    <AnimatePresence>
                      {showAddFunds === goal.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
                          <div className="flex gap-2">
                            <button onClick={() => setShowAddFunds(null)} className="px-3 py-2 bg-[#1f2937] rounded-xl text-gray-400 text-sm">إلغاء</button>
                            <button onClick={() => handleAddFunds(goal.id)} className="flex-1 py-2 bg-[#4ade80] text-black rounded-xl text-sm font-bold">تأكيد</button>
                            <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="المبلغ"
                              className="flex-1 bg-[#0b1120] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right focus:outline-none" />
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

      {/* ─── Debts Section ────────────────────────────────────────────────────── */}
      {section === 'debts' && (
        <div className="px-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1 text-right">ناس مسلّفاهم</p>
              <p className="text-[#4ade80] font-black text-xl text-right">{fmt(totalOwed)}</p>
              <p className="text-gray-500 text-xs text-right">{sym}</p>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1 text-right">أنا مستلّف</p>
              <p className="text-red-400 font-black text-xl text-right">{fmt(totalOwe)}</p>
              <p className="text-gray-500 text-xs text-right">{sym}</p>
            </div>
          </div>

          {/* Debt Type Tabs */}
          <div className="flex gap-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-1 mb-4">
            {[
              { id: 'owed', label: '🤝 مسلّفتهم (ناس بياخد منهم)' },
              { id: 'owe',  label: '💸 مستلّف (أنا اللي بياخد)' },
            ].map(t => (
              <button key={t.id} onClick={() => setDebtTab(t.id as DebtTabType)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${debtTab === t.id ? 'bg-[#ec4899] text-white' : 'text-gray-500'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <button onClick={() => { setNewDebt(d => ({ ...d, type: debtTab })); setShowDebtModal(true); }}
            className="w-full mb-4 py-3.5 rounded-2xl border border-dashed border-[#ec4899]/30 bg-[#ec4899]/5 flex items-center justify-center gap-2 text-[#ec4899] text-sm font-bold hover:bg-[#ec4899]/10 transition-all">
            <Plus size={18} />
            {debtTab === 'owed' ? 'إضافة شخص سلّفته' : 'إضافة مبلغ استلّفته'}
          </button>

          {/* Active Debts */}
          {filteredDebts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#111827] border border-[#1f2937] flex items-center justify-center mb-3">
                <Users2 size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">{debtTab === 'owed' ? 'ما سلّفتش حد' : 'مش مستلّف من حد'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-5">
              {filteredDebts.map((debt, i) => {
                const due = new Date(debt.dueDate);
                const daysLeft = Math.ceil((due.getTime() - new Date().getTime()) / 86400000);
                const isOverdue = daysLeft < 0;
                return (
                  <motion.div key={debt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteDebt(debt.id)} className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all">
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                        <button onClick={() => updateDebt(debt.id, { isPaid: true })}
                          className="w-7 h-7 rounded-full bg-[#4ade80]/10 flex items-center justify-center hover:bg-[#4ade80]/20 transition-all">
                          <CheckCircle size={12} className="text-[#4ade80]" />
                        </button>
                        {debt.phone && (
                          <a href={`tel:${debt.phone}`} className="w-7 h-7 rounded-full bg-[#60a5fa]/10 flex items-center justify-center hover:bg-[#60a5fa]/20 transition-all">
                            <Phone size={12} className="text-[#60a5fa]" />
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{debt.contactName}</p>
                        {debt.notes && <p className="text-gray-500 text-[10px]">{debt.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`text-xs px-2 py-1 rounded-full ${isOverdue ? 'bg-red-500/10 text-red-400' : daysLeft <= 3 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[#1f2937] text-gray-400'}`}>
                        {isOverdue ? `متأخر ${Math.abs(daysLeft)} يوم` : `باقي ${daysLeft} يوم`}
                      </div>
                      <p className={`font-black text-lg ${debt.type === 'owed' ? 'text-[#4ade80]' : 'text-red-400'}`}>{fmt(debt.amount)} <span className="text-xs font-normal text-gray-400">{sym}</span></p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Paid Section */}
          {paidDebts.length > 0 && (
            <div>
              <p className="text-gray-600 text-xs font-bold mb-3 text-right">✓ مسدّد</p>
              {paidDebts.map(debt => (
                <div key={debt.id} className="flex items-center justify-between py-2 px-3 mb-2 bg-[#111827]/50 border border-[#1f2937]/50 rounded-xl opacity-60">
                  <span className="text-gray-600 text-xs line-through">{fmt(debt.amount)} {sym}</span>
                  <span className="text-gray-600 text-xs">{debt.contactName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Add Goal Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGoalModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGoalModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[85vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-center py-4"><div className="w-12 h-1.5 bg-gray-700 rounded-full" /></div>
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowGoalModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
                  <h3 className="text-white font-bold text-lg">هدف ادخار جديد</h3>
                  <div className="w-8" />
                </div>

                <div className="flex gap-3 flex-wrap mb-5 justify-end">
                  {goalIcons.map(icon => (
                    <button key={icon} onClick={() => setNewGoal(g => ({ ...g, icon }))}
                      className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all border ${newGoal.icon === icon ? 'border-[#4ade80] bg-[#4ade80]/10' : 'border-[#1f2937] bg-[#111827]'}`}>
                      {icon}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'name', label: 'اسم الهدف', type: 'text', placeholder: 'مثال: شنطة سفر' },
                  { key: 'targetAmount', label: 'المبلغ المطلوب', type: 'number', placeholder: '0.00' },
                  { key: 'deadline', label: 'الموعد المستهدف', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{f.label}</p>
                    <input type={f.type} value={(newGoal as any)[f.key]} onChange={e => setNewGoal(g => ({ ...g, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-4 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40" />
                  </div>
                ))}

                <button onClick={handleAddGoal} disabled={!newGoal.name || !newGoal.targetAmount}
                  className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-lg mt-2 disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:shadow-none transition-all">
                  حفظ الهدف
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Add Debt Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDebtModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDebtModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[85vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-center py-4"><div className="w-12 h-1.5 bg-gray-700 rounded-full" /></div>
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setShowDebtModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
                  <h3 className="text-white font-bold text-lg">{newDebt.type === 'owed' ? 'سلّفت حد' : 'استلّفت من حد'}</h3>
                  <div className="w-8" />
                </div>

                <div className="flex gap-2 bg-[#111827] rounded-xl p-1 mb-5">
                  {[{ id: 'owed', label: '🤝 سلّفت' }, { id: 'owe', label: '💸 استلّفت' }].map(t => (
                    <button key={t.id} onClick={() => setNewDebt(d => ({ ...d, type: t.id as DebtTabType }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${newDebt.type === t.id ? 'bg-[#ec4899] text-white' : 'text-gray-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'contactName', label: 'الاسم', type: 'text', placeholder: newDebt.type === 'owed' ? 'اسم الشخص اللي سلّفته' : 'اسم الشخص اللي استلّفت منه' },
                  { key: 'phone', label: 'التليفون (اختياري)', type: 'tel', placeholder: '01xxxxxxxxx' },
                  { key: 'amount', label: 'المبلغ', type: 'number', placeholder: '0.00' },
                  { key: 'dueDate', label: 'تاريخ الاستحقاق', type: 'date', placeholder: '' },
                  { key: 'notes', label: 'ملاحظة (اختياري)', type: 'text', placeholder: 'مثال: لغاية آخر الشهر' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{f.label}</p>
                    <input type={f.type} value={(newDebt as any)[f.key]} onChange={e => setNewDebt(d => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-4 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#ec4899]/40" />
                  </div>
                ))}

                <button onClick={handleAddDebt} disabled={!newDebt.contactName || !newDebt.amount || !newDebt.dueDate}
                  className="w-full py-4 rounded-2xl bg-[#ec4899] text-white font-bold text-lg mt-2 disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] disabled:shadow-none transition-all">
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
