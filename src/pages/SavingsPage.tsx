import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trophy, Star, Target, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';

const tierColors: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

const tierBg: Record<string, string> = {
  bronze: '#cd7f3220',
  silver: '#c0c0c020',
  gold: '#ffd70020',
  platinum: '#e5e4e220',
};

export function SavingsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, achievements, user } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: '🎯',
    color: '#4ade80',
  });

  const sym = user?.currency || 'EGP';
  const formatNum = (n: number) => n.toLocaleString('en-US');

  const goalIcons = ['🎯', '💻', '✈️', '🏠', '🚗', '💍', '📱', '🎓', '💰', '🏦'];

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    addSavingsGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      icon: newGoal.icon,
      color: newGoal.color,
      deadline: newGoal.deadline,
    });
    setNewGoal({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: '#4ade80' });
    setShowModal(false);
  };

  const handleAddFunds = (goalId: string) => {
    if (!fundAmount) return;
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      updateSavingsGoal(goalId, {
        currentAmount: goal.currentAmount + parseFloat(fundAmount),
      });
    }
    setFundAmount('');
    setShowAddFunds(null);
  };

  const earnedAch = achievements.filter(a => a.earned);
  const unearnedAch = achievements.filter(a => !a.earned);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">أهداف الادخار</h1>
        <button
          onClick={() => setShowModal(true)}
          className="w-8 h-8 flex items-center justify-center"
        >
          <Plus size={24} className="text-[#4ade80]" />
        </button>
      </div>

      {/* Savings Goals */}
      <div className="px-5 mb-8">
        {savingsGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-[#111827] border border-[#1f2937] rounded-3xl">
            <Target size={32} className="text-gray-600 mb-2" />
            <p className="text-gray-500 text-sm">لا توجد أهداف ادخار</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savingsGoals.map((goal, i) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-[24px] p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    <h3 className="text-white font-bold text-base flex items-center gap-2">
                      {goal.name} <span>{goal.icon}</span>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">{Math.round(pct)}%</span>
                    <div className="text-right flex items-baseline gap-1" style={{ direction: 'ltr' }}>
                      <span className="text-[#4ade80] font-bold text-sm">
                        {formatNum(goal.currentAmount)}
                      </span>
                      <span className="text-gray-500 text-xs font-medium"> / {formatNum(goal.targetAmount)} {sym}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 bg-[#1f2937] rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: pct >= 100 ? '#4ade80' : goal.color }}
                    />
                  </div>

                  {goal.deadline && (
                    <p className="text-gray-500 text-xs text-right font-medium">
                      حتى: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}

                  {/* Add funds inline */}
                  <div className="mt-3 flex justify-end">
                     <button
                        onClick={() => setShowAddFunds(showAddFunds === goal.id ? null : goal.id)}
                        className="text-[#4ade80] text-xs font-bold"
                     >
                        إيداع مبلغ
                     </button>
                  </div>
                  <AnimatePresence>
                    {showAddFunds === goal.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="flex flex-col gap-2">
                          <input
                            type="number"
                            value={fundAmount}
                            onChange={e => setFundAmount(e.target.value)}
                            placeholder="المبلغ"
                            className="w-full bg-[#0b1120] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right focus:outline-none"
                          />
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => setShowAddFunds(null)}
                              className="flex-1 py-2 bg-[#1f2937] rounded-xl text-gray-400 text-sm font-bold"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleAddFunds(goal.id)}
                              className="flex-1 py-2 bg-[#4ade80] text-black rounded-xl text-sm font-bold"
                            >
                              تأكيد
                            </button>
                          </div>
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

      {/* Achievements */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <button className="text-[#4ade80] text-sm font-bold">عرض الكل</button>
          <h2 className="text-white font-bold text-lg">الإنجازات</h2>
        </div>

        {/* Badges Row */}
        <div className="flex justify-between mb-6 px-2">
          {earnedAch.slice(0, 3).map((ach, i) => (
             <div key={ach.id} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 relative flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/20 to-[#4ade80]/5 rounded-[20px] rotate-45 border border-[#4ade80]/30" />
                   <Star size={24} className="text-[#4ade80] z-10" fill="#4ade80" />
                </div>
                <span className="text-white text-[11px] font-bold text-center max-w-[60px] leading-tight mt-1">
                   {ach.name}
                </span>
             </div>
          ))}
          {earnedAch.length === 0 && (
             <div className="w-full text-center py-4">
                <p className="text-gray-500 text-sm">أكمل أهدافك لفتح الإنجازات</p>
             </div>
          )}
        </div>

        {/* Current Rank Card */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-[24px] p-5">
           <div className="flex items-center justify-between mb-4">
              <div className="text-right">
                 <p className="text-gray-400 text-[10px] mb-1">الرتبة الحالية</p>
                 <p className="text-white font-bold text-base flex items-center gap-1 justify-end">Finance Ninja 🥷</p>
                 <p className="text-gray-500 text-xs">1250 XP</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#312e81] border border-[#4f46e5]/40 flex items-center justify-center overflow-hidden">
                 <span className="text-2xl">👤</span>
              </div>
           </div>
           
           <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden mb-2">
              <div className="h-full w-[80%] bg-gradient-to-r from-[#818cf8] to-[#4f46e5] rounded-full" />
           </div>
           
           <p className="text-gray-500 text-[10px] text-center">الرتبة القادمة: Money Master (1500 XP)</p>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-center py-4">
                <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
              </div>
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center">
                    <X size={18} className="text-gray-400" />
                  </button>
                  <h3 className="text-white font-bold text-lg">هدف ادخار جديد</h3>
                  <div className="w-8" />
                </div>

                {/* Icon picker */}
                <p className="text-gray-400 text-xs mb-3 text-right font-medium">أيقونة الهدف</p>
                <div className="flex gap-3 flex-wrap mb-6 justify-end">
                  {goalIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewGoal(g => ({ ...g, icon }))}
                      className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all border ${
                        newGoal.icon === icon ? 'border-[#4ade80] bg-[#4ade80]/10' : 'border-[#1f2937] bg-[#111827]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'name', label: 'اسم الهدف', type: 'text', placeholder: 'مثال: سيارة جديدة' },
                  { key: 'targetAmount', label: 'المبلغ المطلوب', type: 'number', placeholder: '0.00' },
                  { key: 'deadline', label: 'تاريخ الاستحقاق', type: 'date', placeholder: '' },
                ].map(field => (
                  <div key={field.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{field.label}</p>
                    <input
                      type={field.type}
                      value={(newGoal as any)[field.key]}
                      onChange={e => setNewGoal(g => ({ ...g, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-4 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                    />
                  </div>
                ))}

                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.name || !newGoal.targetAmount}
                  className="w-full py-4 rounded-2xl bg-[#4ade80] text-[#070a10] font-bold text-lg mt-4 disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:shadow-none transition-all"
                >
                  حفظ الهدف
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
