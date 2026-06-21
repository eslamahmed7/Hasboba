import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Tv, Music, Dumbbell, Wifi, Phone, Cloud, ShoppingBag,
  TrendingUp, Gem, Coins, DollarSign, BarChart3, Sparkles, ChevronDown, Wallet2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Asset } from '../types';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BG_CARD2 = '#162a2f';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

const subscriptionPresets: Record<string, { icon: any; color: string }> = {
  'نتفليكس':        { icon: Tv,          color: '#e50914' },
  'سبوتيفاي':       { icon: Music,       color: '#1db954' },
  'يوتيوب بريميوم': { icon: Tv,          color: '#ff0000' },
  'فودافون إنترنت': { icon: Wifi,        color: '#e60000' },
  'اتصالات':        { icon: Phone,       color: '#009900' },
  'جيم':            { icon: Dumbbell,    color: '#f97316' },
  'أبل (iCloud)':   { icon: Cloud,       color: '#3b82f6' },
  'أمازون برايم':   { icon: ShoppingBag, color: '#00a8e1' },
};

const assetTypeConfig: Record<Asset['type'], { label: string; icon: any; color: string; emoji: string }> = {
  gold:        { label: 'ذهب',          icon: Gem,        color: '#ffd700', emoji: '🥇' },
  certificate: { label: 'شهادات بنكية', icon: BarChart3,  color: '#60a5fa', emoji: '🏦' },
  forex:       { label: 'عملات أجنبية', icon: DollarSign, color: '#10b981', emoji: '💵' },
  stocks:      { label: 'أسهم',         icon: TrendingUp, color: '#a855f7', emoji: '📈' },
  other:       { label: 'أخرى',         icon: Coins,      color: '#f97316', emoji: '💎' },
};

export function AssetsPage() {
  const { subscriptions, addSubscription, deleteSubscription, assets, addAsset, deleteAsset, user } = useApp();

  const sym = user?.currency || 'EGP';
  const fmt  = (n: number) => n.toLocaleString('en-US');
  const fmt2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [section, setSection] = useState<'assets' | 'subs'>('assets');

  // Subscriptions
  const [showSubModal, setShowSubModal]   = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', billingDate: '', category: 'ترفيه', iconName: 'Tv', color: ACCENT });
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
    setNewSub({ name: '', amount: '', billingDate: '', category: 'ترفيه', iconName: 'Tv', color: ACCENT });
    setShowSubModal(false);
  };

  // Assets
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

  const getAIInsight = () => {
    if (subscriptions.length === 0) return null;
    const most = [...subscriptions].sort((a, b) => b.amount - a.amount)[0];
    return `اشتراك "${most.name}" هو الأغلى بـ ${fmt2(most.amount)} ${sym}/شهر`;
  };

  const netWorth = totalAssets;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28" style={{ background: BG_BASE }}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-white font-bold text-xl text-right">الحسابات</h1>
        <p className="text-xs text-right mt-0.5" style={{ color: '#6a9ca2' }}>أصولك، استثماراتك، اشتراكاتك الشهرية</p>
      </div>

      {/* ── Net Worth Card ──────────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(145deg, #162a2f 0%, #0f1d20 100%)`, border: `1px solid ${BORDER}` }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-3xl" style={{ background: ACCENT }} />
          <div className="relative z-10">
            <p className="text-xs mb-2 text-right" style={{ color: '#6a9ca2' }}>صافي الثروة المُسجَّلة</p>
            <div className="flex items-end gap-2 justify-end mb-4">
              <span className="text-sm font-bold" style={{ color: '#6a9ca2' }}>{sym}</span>
              <span className="text-white font-black" style={{ fontSize: 34, lineHeight: 1 }}>{fmt(netWorth)}</span>
            </div>
            {/* Breakdown row */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-2xl p-3 text-right" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: '#6a9ca2' }}>الأصول</p>
                <p className="font-black text-sm" style={{ color: '#34d399' }}>{fmt(totalAssets)}</p>
              </div>
              <div className="flex-1 rounded-2xl p-3 text-right" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: '#6a9ca2' }}>الاشتراكات/شهر</p>
                <p className="font-black text-sm" style={{ color: '#fb7185' }}>{fmt2(totalMonthly)}</p>
              </div>
              <div className="flex-1 rounded-2xl p-3 text-right" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: '#6a9ca2' }}>عدد الأصول</p>
                <p className="font-black text-sm" style={{ color: ACCENT }}>{assets.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Tabs ─────────────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 rounded-2xl p-1.5" style={{ background: BG_CARD }}>
          {[
            { id: 'assets', label: 'الأصول والاستثمارات', icon: Gem },
            { id: 'subs',   label: 'الاشتراكات الشهرية',  icon: Tv  },
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

      {/* ── Assets Section ───────────────────────────────────────────────────────── */}
      {section === 'assets' && (
        <div className="px-4">
          {/* Add button */}
          <button onClick={() => setShowAssetModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
            style={{ border: `1.5px dashed ${ACCENT}40`, background: `rgba(0,173,181,0.05)`, color: ACCENT }}>
            <Plus size={18} /> إضافة أصل جديد
          </button>

          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <Gem size={32} style={{ color: '#2d4a50' }} />
              </div>
              <p className="font-bold text-base" style={{ color: '#6a9ca2' }}>لا يوجد أصول مسجلة</p>
              <p className="text-sm mt-1" style={{ color: '#3a6068' }}>سجّل ذهبك، شهاداتك، أو أسهمك</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {assets.map((a, i) => {
                const cfg  = assetTypeConfig[a.type];
                const Icon = cfg.icon;
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => deleteAsset(a.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(244,63,94,0.1)' }}>
                        <Trash2 size={12} style={{ color: '#f43f5e' }} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-white font-bold text-sm">{a.name}</p>
                          <p className="text-[10px]" style={{ color: '#4a7a80' }}>{cfg.label}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: cfg.color + '18', border: `1px solid ${cfg.color}30` }}>
                          <Icon size={18} style={{ color: cfg.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-black text-base" style={{ color: cfg.color }}>
                        {fmt(a.totalValue)} {sym}
                      </p>
                      <p className="text-xs" style={{ color: '#4a7a80' }}>
                        {fmt(a.amount)} × {fmt(a.valuePerUnit)}
                      </p>
                    </div>
                    {a.notes && <p className="text-[10px] mt-1 text-right" style={{ color: '#3a6068' }}>{a.notes}</p>}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Subscriptions Section ────────────────────────────────────────────────── */}
      {section === 'subs' && (
        <div className="px-4">
          {/* Monthly total */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#4a7a80' }}>{subscriptions.length} اشتراك</span>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: '#6a9ca2' }}>الإجمالي الشهري</p>
                <p className="font-black text-2xl" style={{ color: '#fb7185' }}>
                  {fmt2(totalMonthly)} <span className="text-sm" style={{ color: '#4a7a80' }}>{sym}</span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          {getAIInsight() && (
            <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
              style={{ background: `rgba(0,173,181,0.05)`, border: `1px solid rgba(0,173,181,0.15)` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `rgba(0,173,181,0.15)` }}>
                <Sparkles size={16} style={{ color: ACCENT }} />
              </div>
              <div className="text-right flex-1">
                <p className="text-xs font-bold mb-0.5" style={{ color: ACCENT }}>تنبيه ذكي</p>
                <p className="text-xs" style={{ color: '#a0c4c8' }}>{getAIInsight()}</p>
              </div>
            </div>
          )}

          {/* Add button */}
          <button onClick={() => setShowSubModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold"
            style={{ border: `1.5px dashed ${ACCENT}40`, background: `rgba(0,173,181,0.05)`, color: ACCENT }}>
            <Plus size={18} /> إضافة اشتراك
          </button>

          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <Tv size={32} style={{ color: '#2d4a50' }} />
              </div>
              <p className="font-bold text-base" style={{ color: '#6a9ca2' }}>لا يوجد اشتراكات</p>
              <p className="text-sm mt-1" style={{ color: '#3a6068' }}>سجّل اشتراكاتك الشهرية لمتابعة مصاريفك</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub, i) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <button onClick={() => deleteSubscription(sub.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(244,63,94,0.1)' }}>
                    <Trash2 size={12} style={{ color: '#f43f5e' }} />
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-white font-bold text-sm">{sub.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4a7a80' }}>{sub.billingDate} · {sub.category}</p>
                  </div>
                  <p className="font-black text-base" style={{ color: '#fb7185' }}>
                    {fmt2(sub.amount)} <span className="text-xs" style={{ color: '#4a7a80' }}>{sym}</span>
                  </p>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: sub.color + '20', border: `1px solid ${sub.color}30` }}>
                    <Tv size={18} style={{ color: sub.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Asset Modal ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAssetModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAssetModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}>
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowAssetModal(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">إضافة أصل</h3>
                  <div className="w-9" />
                </div>

                <p className="text-xs mb-3 text-right font-medium" style={{ color: '#6a9ca2' }}>نوع الأصل</p>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {Object.entries(assetTypeConfig).map(([type, cfg]) => {
                    const isSelected = newAsset.type === type;
                    return (
                      <button key={type} onClick={() => setNewAsset(a => ({ ...a, type: type as Asset['type'] }))}
                        className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
                        style={{
                          background: isSelected ? cfg.color + '18' : BG_CARD,
                          border: `1.5px solid ${isSelected ? cfg.color : BORDER}`,
                        }}>
                        <span className="text-xl">{cfg.emoji}</span>
                        <span className="text-[9px] font-bold" style={{ color: isSelected ? cfg.color : '#4a7a80' }}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                {[
                  { key: 'name',         label: 'اسم الأصل',       placeholder: 'مثال: سبيكة 10 جرام' },
                  { key: 'amount',       label: 'الكمية',           placeholder: '1' },
                  { key: 'valuePerUnit', label: `سعر الوحدة (${sym})`, placeholder: '0.00' },
                  { key: 'notes',        label: 'ملاحظة (اختياري)', placeholder: 'محفوظ في البنك الأهلي' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>{f.label}</p>
                    <input type={f.key === 'notes' || f.key === 'name' ? 'text' : 'number'}
                      value={(newAsset as any)[f.key]}
                      onChange={e => setNewAsset(a => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  </div>
                ))}

                {newAsset.amount && newAsset.valuePerUnit && (
                  <div className="rounded-xl p-3 mb-4 text-right"
                    style={{ background: `rgba(0,173,181,0.08)`, border: `1px solid rgba(0,173,181,0.2)` }}>
                    <p className="text-xs mb-1" style={{ color: '#6a9ca2' }}>الإجمالي المحتسب</p>
                    <p className="font-black text-xl" style={{ color: ACCENT }}>
                      {fmt(parseFloat(newAsset.amount) * parseFloat(newAsset.valuePerUnit))} {sym}
                    </p>
                  </div>
                )}

                <button onClick={handleAddAsset} disabled={!newAsset.name || !newAsset.amount || !newAsset.valuePerUnit}
                  className="w-full py-4 rounded-2xl font-bold text-base transition-all"
                  style={{
                    background: newAsset.name && newAsset.amount && newAsset.valuePerUnit
                      ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`
                      : BG_CARD,
                    color: newAsset.name && newAsset.amount && newAsset.valuePerUnit ? 'white' : '#3a6068',
                  }}>
                  حفظ الأصل
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Subscription Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSubModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}>
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowSubModal(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">اشتراك جديد</h3>
                  <div className="w-9" />
                </div>

                <p className="text-xs mb-3 text-right font-medium" style={{ color: '#6a9ca2' }}>اختر من الشائعة</p>
                <div className="flex gap-2 flex-wrap justify-end mb-5">
                  {Object.keys(subscriptionPresets).map(name => (
                    <button key={name} onClick={() => setNewSub(s => ({ ...s, name }))}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: newSub.name === name ? `rgba(0,173,181,0.15)` : BG_CARD,
                        border: `1px solid ${newSub.name === name ? ACCENT : BORDER}`,
                        color: newSub.name === name ? ACCENT : '#4a7a80',
                      }}>
                      {name}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'name',        label: 'اسم الاشتراك',    type: 'text',   placeholder: 'أو اكتب اسماً آخر' },
                  { key: 'amount',      label: `المبلغ الشهري (${sym})`, type: 'number', placeholder: '0.00' },
                  { key: 'billingDate', label: 'تاريخ التجديد',   type: 'date',   placeholder: '' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>{f.label}</p>
                    <input type={f.type} value={(newSub as any)[f.key]}
                      onChange={e => setNewSub(s => ({ ...s, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  </div>
                ))}

                <button onClick={handleAddSub} disabled={!newSub.name || !newSub.amount || !newSub.billingDate}
                  className="w-full py-4 rounded-2xl font-bold text-base transition-all"
                  style={{
                    background: newSub.name && newSub.amount && newSub.billingDate
                      ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`
                      : BG_CARD,
                    color: newSub.name && newSub.amount && newSub.billingDate ? 'white' : '#3a6068',
                  }}>
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
