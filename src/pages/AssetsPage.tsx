import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Tv, Music, Dumbbell, Wifi, Phone, Cloud, ShoppingBag,
  TrendingUp, Gem, Coins, DollarSign, BarChart3, Sparkles, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Asset } from '../types';

const subscriptionPresets: Record<string, { icon: any; color: string }> = {
  'نتفليكس':       { icon: Tv,          color: '#e50914' },
  'سبوتيفاي':      { icon: Music,       color: '#1db954' },
  'يوتيوب بريميوم':{ icon: Tv,          color: '#ff0000' },
  'فودافون إنترنت':{ icon: Wifi,        color: '#e60000' },
  'اتصالات':       { icon: Phone,       color: '#009900' },
  'جيم':           { icon: Dumbbell,    color: '#f97316' },
  'أبل (iCloud)':  { icon: Cloud,       color: '#3b82f6' },
  'أمازون برايم':  { icon: ShoppingBag, color: '#00a8e1' },
};

const assetTypeConfig: Record<Asset['type'], { label: string; icon: any; color: string; emoji: string }> = {
  gold:        { label: 'ذهب',         icon: Gem,       color: '#ffd700', emoji: '🥇' },
  certificate: { label: 'شهادات بنكية', icon: BarChart3, color: '#60a5fa', emoji: '🏦' },
  forex:       { label: 'عملات أجنبية', icon: DollarSign,color: '#4ade80', emoji: '💵' },
  stocks:      { label: 'أسهم',         icon: TrendingUp, color: '#a855f7', emoji: '📈' },
  other:       { label: 'أخرى',         icon: Coins,      color: '#f97316', emoji: '💎' },
};

export function AssetsPage() {
  const { subscriptions, addSubscription, deleteSubscription, assets, addAsset, deleteAsset, user } = useApp();

  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');
  const fmt2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [section, setSection] = useState<'assets' | 'subs'>('assets');

  // ─── Subscriptions state ─────────────────────────────────────────────────────
  const [showSubModal, setShowSubModal] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', billingDate: '', category: 'ترفيه', iconName: 'Tv', color: '#4ade80' });
  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);

  const handleAddSub = () => {
    if (!newSub.name || !newSub.amount || !newSub.billingDate) return;
    const preset = subscriptionPresets[newSub.name];
    addSubscription({
      name: newSub.name, amount: parseFloat(newSub.amount),
      billingDate: newSub.billingDate, category: newSub.category,
      icon: preset ? preset.icon.name : 'ShoppingBag',
      color: preset ? preset.color : newSub.color,
    });
    setNewSub({ name: '', amount: '', billingDate: '', category: 'ترفيه', iconName: 'Tv', color: '#4ade80' });
    setShowSubModal(false);
  };

  // ─── Assets state ─────────────────────────────────────────────────────────────
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState<{ name: string; type: Asset['type']; amount: string; valuePerUnit: string; notes: string }>({
    name: '', type: 'gold', amount: '', valuePerUnit: '', notes: '',
  });

  const totalAssets = assets.reduce((s, a) => s + a.totalValue, 0);
  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.amount || !newAsset.valuePerUnit) return;
    const amount = parseFloat(newAsset.amount);
    const valuePerUnit = parseFloat(newAsset.valuePerUnit);
    addAsset({ name: newAsset.name, type: newAsset.type, amount, valuePerUnit, totalValue: amount * valuePerUnit, currency: sym, notes: newAsset.notes });
    setNewAsset({ name: '', type: 'gold', amount: '', valuePerUnit: '', notes: '' });
    setShowAssetModal(false);
  };

  // AI Advisor insight
  const getAIInsight = () => {
    if (subscriptions.length === 0) return null;
    const mostExpensive = [...subscriptions].sort((a, b) => b.amount - a.amount)[0];
    return `اشتراك "${mostExpensive.name}" هو الأغلى بـ ${fmt2(mostExpensive.amount)} ${sym}/شهر`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
            <TrendingUp size={16} className="text-[#a855f7]" />
          </div>
          <h1 className="text-white font-bold text-xl">الاستثمار والاشتراكات</h1>
        </div>
        <p className="text-gray-500 text-xs text-right">أصولك، استثماراتك، اشتراكاتك الشهرية</p>
      </div>

      {/* Section Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-1">
          {[
            { id: 'assets', label: 'الأصول والاستثمارات', icon: Gem },
            { id: 'subs',   label: 'الاشتراكات الشهرية',  icon: Tv },
          ].map(s => {
            const Icon = s.icon;
            const isActive = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive ? 'bg-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]' : 'text-gray-500'
                }`}>
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Assets Section ───────────────────────────────────────────────────── */}
      {section === 'assets' && (
        <div className="px-5">
          {/* Total Value Card */}
          <div className="bg-gradient-to-br from-[#1a0533] to-[#0f1729] border border-[#a855f7]/20 rounded-3xl p-5 mb-5">
            <p className="text-gray-400 text-xs mb-2 text-right">إجمالي الثروة المُسجَّلة</p>
            <p className="text-white font-black text-3xl text-right mb-1">{fmt(totalAssets)}</p>
            <p className="text-[#a855f7] text-sm font-medium text-right">{sym}</p>
            <div className="mt-4 flex gap-3">
              {Object.entries(assetTypeConfig).map(([type, cfg]) => {
                const typeAssets = assets.filter(a => a.type === type);
                if (typeAssets.length === 0) return null;
                const typeTotal = typeAssets.reduce((s, a) => s + a.totalValue, 0);
                return (
                  <div key={type} className="flex-1 text-center">
                    <p className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.emoji}</p>
                    <p className="text-white font-bold text-xs mt-0.5">{fmt(typeTotal)}</p>
                    <p className="text-gray-500 text-[10px]">{cfg.label}</p>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>

          {/* Add Button */}
          <button onClick={() => setShowAssetModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl border border-dashed border-[#a855f7]/30 bg-[#a855f7]/5 flex items-center justify-center gap-2 text-[#a855f7] text-sm font-bold hover:bg-[#a855f7]/10 transition-all">
            <Plus size={18} /> إضافة أصل جديد
          </button>

          {/* Assets List */}
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#111827] border border-[#1f2937] flex items-center justify-center mb-4">
                <Gem size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold text-base mb-1">لا يوجد أصول مسجلة</p>
              <p className="text-gray-600 text-sm">سجّل ذهبك، شهاداتك، أو أسهمك لمتابعة ثروتك</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {assets.map((a, i) => {
                const cfg = assetTypeConfig[a.type];
                const Icon = cfg.icon;
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => deleteAsset(a.id)} className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-white font-bold text-sm">{a.name}</p>
                          <p className="text-gray-500 text-[10px]">{cfg.label}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: cfg.color + '15', borderColor: cfg.color + '30' }}>
                          <Icon size={18} style={{ color: cfg.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-left" style={{ direction: 'ltr' }}>
                        <p className="text-gray-400 text-xs">{fmt(a.amount)} × {fmt(a.valuePerUnit)} = <span className="font-bold" style={{ color: cfg.color }}>{fmt(a.totalValue)} {sym}</span></p>
                      </div>
                      {a.notes && <p className="text-gray-600 text-[10px]">{a.notes}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Subscriptions Section ───────────────────────────────────────────── */}
      {section === 'subs' && (
        <div className="px-5">
          {/* Monthly Total */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">{subscriptions.length} اشتراك</span>
              <div className="text-right">
                <p className="text-white font-bold text-xs mb-0.5">الإجمالي الشهري</p>
                <p className="text-red-400 font-black text-2xl">{fmt2(totalMonthly)} <span className="text-sm text-gray-400">{sym}</span></p>
              </div>
            </div>
          </div>

          {/* AI Advisor Card */}
          {getAIInsight() && (
            <div className="bg-[#1a0533] border border-[#a855f7]/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#a855f7]/20 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-[#a855f7]" />
              </div>
              <div className="text-right flex-1">
                <p className="text-[#a855f7] text-xs font-bold mb-0.5">تنبيه ذكي</p>
                <p className="text-gray-300 text-xs">{getAIInsight()}</p>
              </div>
            </div>
          )}

          {/* Add Button */}
          <button onClick={() => setShowSubModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl border border-dashed border-[#a855f7]/30 bg-[#a855f7]/5 flex items-center justify-center gap-2 text-[#a855f7] text-sm font-bold hover:bg-[#a855f7]/10 transition-all">
            <Plus size={18} /> إضافة اشتراك
          </button>

          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#111827] border border-[#1f2937] flex items-center justify-center mb-4">
                <Tv size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold text-base mb-1">لا يوجد اشتراكات</p>
              <p className="text-gray-600 text-sm">سجّل اشتراكاتك الشهرية لمتابعة مصاريفك</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub, i) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 flex items-center gap-3">
                  <button onClick={() => deleteSubscription(sub.id)} className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all shrink-0">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-white font-bold text-sm">{sub.name}</p>
                    <p className="text-gray-500 text-xs">{sub.billingDate} • {sub.category}</p>
                  </div>
                  <p className="text-red-400 font-bold text-base">{fmt2(sub.amount)} <span className="text-xs text-gray-500">{sym}</span></p>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0" style={{ backgroundColor: sub.color + '20', borderColor: sub.color + '30' }}>
                    <Tv size={18} style={{ color: sub.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Add Asset Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAssetModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssetModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-center py-4"><div className="w-12 h-1.5 bg-gray-700 rounded-full" /></div>
              <div className="px-6 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowAssetModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
                  <h3 className="text-white font-bold text-lg">إضافة أصل</h3>
                  <div className="w-8" />
                </div>

                {/* Asset Type */}
                <p className="text-gray-400 text-xs mb-3 text-right font-medium">نوع الأصل</p>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {Object.entries(assetTypeConfig).map(([type, cfg]) => {
                    const Icon = cfg.icon;
                    const isSelected = newAsset.type === type;
                    return (
                      <button key={type} onClick={() => setNewAsset(a => ({ ...a, type: type as Asset['type'] }))}
                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${isSelected ? 'border-current' : 'border-[#1f2937] bg-[#111827]'}`}
                        style={isSelected ? { borderColor: cfg.color, backgroundColor: cfg.color + '15' } : {}}>
                        <span className="text-xl">{cfg.emoji}</span>
                        <span className="text-[9px] font-bold" style={isSelected ? { color: cfg.color } : { color: '#6b7280' }}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                {[
                  { key: 'name', label: 'اسم الأصل', type: 'text', placeholder: newAsset.type === 'gold' ? 'مثال: سبيكة 10 جرام' : 'اسم الأصل' },
                  { key: 'amount', label: 'الكمية / عدد الوحدات', type: 'number', placeholder: newAsset.type === 'gold' ? 'عدد الجرامات' : '1' },
                  { key: 'valuePerUnit', label: `سعر الوحدة الواحدة (${sym})`, type: 'number', placeholder: '0.00' },
                  { key: 'notes', label: 'ملاحظة (اختياري)', type: 'text', placeholder: 'مثال: محفوظ في البنك الأهلي' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{f.label}</p>
                    <input type={f.type} value={(newAsset as any)[f.key]} onChange={e => setNewAsset(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#a855f7]/40" />
                  </div>
                ))}

                {/* Live Calculation */}
                {newAsset.amount && newAsset.valuePerUnit && (
                  <div className="bg-[#1a0533] border border-[#a855f7]/20 rounded-xl p-3 mb-4 text-right">
                    <p className="text-gray-400 text-xs mb-1">الإجمالي المحتسب</p>
                    <p className="text-[#a855f7] font-black text-xl">{fmt(parseFloat(newAsset.amount) * parseFloat(newAsset.valuePerUnit))} <span className="text-sm">{sym}</span></p>
                  </div>
                )}

                <button onClick={handleAddAsset} disabled={!newAsset.name || !newAsset.amount || !newAsset.valuePerUnit}
                  className="w-full py-4 rounded-2xl bg-[#a855f7] text-white font-bold text-base shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 disabled:shadow-none transition-all">
                  حفظ الأصل
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Add Subscription Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSubModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-center py-4"><div className="w-12 h-1.5 bg-gray-700 rounded-full" /></div>
              <div className="px-6 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowSubModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
                  <h3 className="text-white font-bold text-lg">اشتراك جديد</h3>
                  <div className="w-8" />
                </div>

                {/* Presets */}
                <p className="text-gray-400 text-xs mb-3 text-right font-medium">اختر من الشائعة</p>
                <div className="flex gap-2 flex-wrap justify-end mb-5">
                  {Object.keys(subscriptionPresets).map(name => (
                    <button key={name} onClick={() => setNewSub(s => ({ ...s, name }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${newSub.name === name ? 'border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]' : 'border-[#1f2937] bg-[#111827] text-gray-400'}`}>
                      {name}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'name', label: 'اسم الاشتراك', type: 'text', placeholder: 'أو أكتب اسم اشتراك آخر' },
                  { key: 'amount', label: `المبلغ الشهري (${sym})`, type: 'number', placeholder: '0.00' },
                  { key: 'billingDate', label: 'تاريخ التجديد', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{f.label}</p>
                    <input type={f.type} value={(newSub as any)[f.key]} onChange={e => setNewSub(s => ({ ...s, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#a855f7]/40" />
                  </div>
                ))}

                <button onClick={handleAddSub} disabled={!newSub.name || !newSub.amount || !newSub.billingDate}
                  className="w-full py-4 rounded-2xl bg-[#a855f7] text-white font-bold text-base shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 disabled:shadow-none transition-all">
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
