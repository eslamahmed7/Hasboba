import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Tv, Music, Dumbbell, Wifi, Phone, Cloud, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

const subscriptionPresets: Record<string, { icon: any; color: string; label: string }> = {
  'نتفليكس': { icon: Tv, color: '#e50914', label: 'Netflix' },
  'سبوتيفاي': { icon: Music, color: '#1db954', label: 'Spotify' },
  'يوتيوب بريميوم': { icon: Tv, color: '#ff0000', label: 'YouTube' },
  'فودافون إنترنت': { icon: Wifi, color: '#e60000', label: 'Vodafone' },
  'اتصالات': { icon: Phone, color: '#009900', label: 'Etisalat' },
  'جيم النادي': { icon: Dumbbell, color: '#f97316', label: 'Gym Club' },
  'أبل (iCloud)': { icon: Cloud, color: '#3b82f6', label: 'Apple iCloud' },
  'أمازون برايم': { icon: ShoppingBag, color: '#00a8e1', label: 'Amazon' },
};

const iconComponents: Record<string, any> = {
  Tv, Music, Dumbbell, Wifi, Phone, Cloud, ShoppingBag
};

export function SubscriptionsManager() {
  const { subscriptions, addSubscription, deleteSubscription, user } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    billingDate: '',
    category: 'ترفيه',
    iconName: 'Tv',
    color: '#4ade80',
  });

  const sym = user?.currency || 'EGP';
  const formatNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);

  const handleAdd = () => {
    if (!newSub.name || !newSub.amount || !newSub.billingDate) return;
    
    addSubscription({
      name: newSub.name,
      amount: parseFloat(newSub.amount),
      billingDate: newSub.billingDate,
      icon: newSub.iconName,
      color: newSub.color,
      category: newSub.category,
    });
    setNewSub({ name: '', amount: '', billingDate: '', category: 'ترفيه', iconName: 'Tv', color: '#4ade80' });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">الاشتراكات</h1>
        <button
          onClick={() => setShowModal(true)}
          className="w-8 h-8 flex items-center justify-center"
        >
          <Plus size={24} className="text-[#4ade80]" />
        </button>
      </div>

      {/* Subscriptions list */}
      <div className="px-5">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-[#111827] border border-[#1f2937] rounded-3xl">
            <span className="text-4xl mb-3">📱</span>
            <p className="text-gray-500 text-sm">لا توجد اشتراكات</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((sub, i) => {
              // Map icon string back to component, fallback to Tv
              const IconComp = iconComponents[sub.icon] || Tv;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-[#111827] border border-[#1f2937] rounded-[20px] group hover:border-[#4ade80]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                    <div className="text-right">
                      <p className="text-white text-sm font-bold">{sub.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        التجديد: {sub.billingDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right" style={{ direction: 'ltr' }}>
                      <p className="text-white font-bold text-sm">{formatNum(sub.amount)} {sym}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 border bg-[#0b1120] overflow-hidden"
                      style={{ borderColor: sub.color + '40' }}
                    >
                      <IconComp size={24} style={{ color: sub.color }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
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
                  <h3 className="text-white font-bold text-lg">اشتراك جديد</h3>
                  <div className="w-8" />
                </div>

                {/* Quick presets */}
                <p className="text-gray-400 text-xs mb-3 text-right font-medium">اختيار سريع</p>
                <div className="flex gap-2 flex-wrap mb-6 justify-end">
                  {Object.entries(subscriptionPresets).map(([name, data]) => {
                    const PresetIcon = data.icon;
                    return (
                      <button
                        key={name}
                        onClick={() => setNewSub(s => ({ ...s, name: data.label, iconName: data.icon.name || 'Tv', color: data.color }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          newSub.name === data.label ? 'border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]' : 'border-[#1f2937] bg-[#111827] text-gray-400 hover:bg-[#1f2937]'
                        }`}
                      >
                        <PresetIcon size={14} style={{ color: data.color }} />
                        {data.label}
                      </button>
                    );
                  })}
                </div>

                {[
                  { key: 'name', label: 'اسم الخدمة', type: 'text', placeholder: 'مثال: Netflix' },
                  { key: 'amount', label: 'المبلغ الشهري', type: 'number', placeholder: '0.00' },
                  { key: 'billingDate', label: 'تاريخ التجديد', type: 'date', placeholder: '' },
                ].map(field => (
                  <div key={field.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{field.label}</p>
                    <input
                      type={field.type}
                      value={(newSub as any)[field.key]}
                      onChange={e => setNewSub(s => ({ ...s, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-4 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                      style={field.type === 'number' ? { direction: 'ltr' } : {}}
                    />
                  </div>
                ))}

                <button
                  onClick={handleAdd}
                  disabled={!newSub.name || !newSub.amount}
                  className="w-full py-4 rounded-2xl bg-[#4ade80] text-[#070a10] font-bold text-lg mt-4 disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:shadow-none"
                >
                  إضافة الاشتراك
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
