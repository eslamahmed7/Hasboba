import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Phone, MoreVertical, CheckCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

type TabType = 'owed' | 'owe';

export function DebtTracker() {
  const { debts, addDebt, updateDebt, deleteDebt, user } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('owed');
  const [showModal, setShowModal] = useState(false);
  const [newDebt, setNewDebt] = useState({
    contactName: '',
    phone: '',
    amount: '',
    dueDate: '',
    type: 'owed' as 'owed' | 'owe',
    notes: '',
  });

  const sym = user?.currency || 'EGP';
  const filteredDebts = debts.filter(d => d.type === activeTab && !d.isPaid);
  const paidDebts = debts.filter(d => d.type === activeTab && d.isPaid);

  const totalOwed = debts.filter(d => d.type === 'owed' && !d.isPaid).reduce((s, d) => s + d.amount, 0);
  const totalOwe = debts.filter(d => d.type === 'owe' && !d.isPaid).reduce((s, d) => s + d.amount, 0);

  const formatNum = (n: number) => n.toLocaleString('en-US');

  const handleAdd = () => {
    if (!newDebt.contactName || !newDebt.amount || !newDebt.dueDate) return;
    addDebt({
      contactName: newDebt.contactName,
      phone: newDebt.phone,
      amount: parseFloat(newDebt.amount),
      dueDate: newDebt.dueDate,
      type: newDebt.type,
      isPaid: false,
      notes: newDebt.notes,
    });
    setNewDebt({ contactName: '', phone: '', amount: '', dueDate: '', type: 'owed', notes: '' });
    setShowModal(false);
  };

  const formatDueDate = (d: string) => {
    const date = new Date(d);
    return `يستحق ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <button
          onClick={() => setShowModal(true)}
          className="w-9 h-9 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center"
        >
          <Plus size={18} className="text-[#4ade80]" />
        </button>
        <h1 className="text-white font-bold text-base">الديون (النظام الذاتي)</h1>
      </div>

      {/* Summary cards */}
      <div className="px-5 flex gap-3 mb-4">
        <div
          onClick={() => setActiveTab('owed')}
          className={`flex-1 rounded-2xl p-3.5 border cursor-pointer transition-all ${
            activeTab === 'owed'
              ? 'bg-[#4ade80]/10 border-[#4ade80]/30'
              : 'bg-[#111827] border-[#1f2937]'
          }`}
        >
          <p className={`text-xs font-bold mb-1 text-right ${activeTab === 'owed' ? 'text-[#4ade80]' : 'text-gray-400'}`}>
            مسلف
          </p>
          <p className={`text-base font-black text-right ${activeTab === 'owed' ? 'text-[#4ade80]' : 'text-white'}`}>
            {formatNum(totalOwed)}
          </p>
          <p className="text-gray-600 text-xs text-right">{sym}</p>
        </div>
        <div
          onClick={() => setActiveTab('owe')}
          className={`flex-1 rounded-2xl p-3.5 border cursor-pointer transition-all ${
            activeTab === 'owe'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-[#111827] border-[#1f2937]'
          }`}
        >
          <p className={`text-xs font-bold mb-1 text-right ${activeTab === 'owe' ? 'text-red-400' : 'text-gray-400'}`}>
            مستلف
          </p>
          <p className={`text-base font-black text-right ${activeTab === 'owe' ? 'text-red-400' : 'text-white'}`}>
            {formatNum(totalOwe)}
          </p>
          <p className="text-gray-600 text-xs text-right">{sym}</p>
        </div>
      </div>

      {/* Debt list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-4">
        {filteredDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mb-3">
              <CheckCircle size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">لا توجد ديون نشطة</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredDebts.map((debt, i) => (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-[#111827] border border-[#1f2937] rounded-2xl"
              >
                <div className="flex items-center gap-2">
                  {/* Action buttons */}
                  <div className="flex flex-col gap-1">
                    {debt.phone && (
                      <a
                        href={`https://wa.me/${debt.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center"
                      >
                        <Phone size={14} className="text-[#25D366]" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-bold">{debt.contactName}</p>
                    <p className="text-gray-500 text-xs">{formatDueDate(debt.dueDate)}</p>
                    {debt.notes && <p className="text-gray-600 text-xs mt-0.5">{debt.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-black text-base ${activeTab === 'owed' ? 'text-[#4ade80]' : 'text-red-400'}`}>
                      {formatNum(debt.amount)}
                    </p>
                    <p className="text-gray-600 text-xs">{sym}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#1a2535] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-sm">
                      {debt.contactName.charAt(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paid debts */}
        {paidDebts.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-600 text-xs text-right mb-2">المسددة</p>
            {paidDebts.map(debt => (
              <div key={debt.id} className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#1f2937] rounded-xl mb-2 opacity-50">
                <div className="text-right">
                  <p className="text-gray-400 text-sm line-through">{debt.contactName}</p>
                </div>
                <span className="text-gray-500 text-sm font-bold line-through">{formatNum(debt.amount)} {sym}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117] rounded-t-3xl border-t border-[#1f2937] max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-gray-700 rounded-full" />
              </div>
              <div className="px-5 pb-6">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setShowModal(false)}>
                    <X size={20} className="text-gray-400" />
                  </button>
                  <h3 className="text-white font-bold">إضافة دين جديد</h3>
                  <div className="w-5" />
                </div>

                {/* Type */}
                <div className="flex gap-2 bg-[#111827] rounded-2xl p-1 mb-4">
                  <button
                    onClick={() => setNewDebt(d => ({ ...d, type: 'owed' }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${newDebt.type === 'owed' ? 'bg-[#4ade80] text-black' : 'text-gray-500'}`}
                  >
                    مسلف
                  </button>
                  <button
                    onClick={() => setNewDebt(d => ({ ...d, type: 'owe' }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${newDebt.type === 'owe' ? 'bg-red-500 text-white' : 'text-gray-500'}`}
                  >
                    مستلف
                  </button>
                </div>

                {[
                  { key: 'contactName', label: 'اسم الشخص', type: 'text', placeholder: 'مثل: محمد أحمد' },
                  { key: 'phone', label: 'رقم الواتساب', type: 'tel', placeholder: '+201xxxxxxxxx' },
                  { key: 'amount', label: 'المبلغ', type: 'number', placeholder: '0' },
                  { key: 'dueDate', label: 'تاريخ الاستحقاق', type: 'date', placeholder: '' },
                  { key: 'notes', label: 'ملاحظات', type: 'text', placeholder: 'سبب الدين...' },
                ].map(field => (
                  <div key={field.key} className="mb-3">
                    <p className="text-gray-500 text-xs mb-1.5 text-right">{field.label}</p>
                    <input
                      type={field.type}
                      value={(newDebt as any)[field.key]}
                      onChange={e => setNewDebt(d => ({ ...d, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl py-3 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                    />
                  </div>
                ))}

                <button
                  onClick={handleAdd}
                  disabled={!newDebt.contactName || !newDebt.amount || !newDebt.dueDate}
                  className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  إضافة الدين
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
