import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, CheckCircle2, Tag, CreditCard,
  Lock, ChevronRight, Shield, Zap, Bot, Camera, Mic,
  Check, Star, ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { PromoCode } from '../types';

interface SubscriptionModalProps {
  onClose: () => void;
}

type ModalStep = 'plan' | 'payment' | 'success';

const proFeatures = [
  { icon: Bot,    label: 'مستشار مالي ذكي (AI Coach)',           desc: 'نصائح مخصصة لوضعك المالي' },
  { icon: Camera, label: 'قراءة الفواتير بالكاميرا',              desc: 'إضافة مصاريفك بصورة واحدة' },
  { icon: Mic,    label: 'تسجيل المصروفات بالصوت',              desc: 'قل فقط "صرفت 50 جنيه"' },
  { icon: Zap,    label: 'تحليلات ذكية متقدمة',                   desc: 'اعرف أين تذهب فلوسك بالضبط' },
  { icon: Shield, label: 'تشفير ومزامنة آمنة',                    desc: 'بياناتك محمية ومحفوظة دائماً' },
];

const cardBrands = ['💳 فيزا', '💳 ماستركارد', '💳 ميزة'];

export function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const { user, setUser, appConfig, incrementPromoCodeUsage } = useApp();

  const [step, setStep] = useState<ModalStep>('plan');
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  // Mock payment form state
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [payError, setPayError] = useState('');

  const sym = user?.currencySymbol || 'ج.م';
  const basePrice = appConfig.aiSubscriptionPrice;
  const priceBeforePromo = appConfig.aiSubscriptionDiscountPrice !== null
    ? appConfig.aiSubscriptionDiscountPrice
    : basePrice;
  const finalPrice = appliedPromo
    ? Math.round(priceBeforePromo - (priceBeforePromo * (appliedPromo.discountPercentage / 100)))
    : priceBeforePromo;
  const savings = basePrice - finalPrice;

  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoInput.trim()) return;
    const promo = appConfig.promoCodes.find(p => p.code.toLowerCase() === promoInput.trim().toLowerCase());
    if (!promo) { setPromoError('كود الخصم غير صحيح'); return; }
    if (!promo.isActive) { setPromoError('كود الخصم غير فعال حالياً'); return; }
    if (new Date(promo.expiresAt) < new Date()) { setPromoError('كود الخصم منتهي الصلاحية'); return; }
    if (promo.usageLimit !== null && promo.usageLimit !== undefined && promo.usageCount >= promo.usageLimit) {
      setPromoError('كود الخصم استنفد الحد الأقصى للاستخدام'); return;
    }
    setAppliedPromo(promo);
    setPromoInput('');
  };

  // Format card number with spaces
  const handleCardNum = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    setCardNum(digits.replace(/(.{4})/g, '$1 ').trim());
  };
  const handleExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    setExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const handlePayment = async () => {
    // Basic validation
    if (cardNum.replace(/\s/g, '').length < 16) { setPayError('رقم البطاقة غير مكتمل'); return; }
    if (!cardName.trim()) { setPayError('أدخل اسم حامل البطاقة'); return; }
    if (expiry.length < 5) { setPayError('أدخل تاريخ الانتهاء'); return; }
    if (cvv.length < 3) { setPayError('CVV غير صحيح'); return; }
    setPayError('');
    setLoading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    try {
      if (user) {
        await supabase.from('profiles').update({ plan: 'pro' }).eq('id', user.id);
        setUser({ ...user, plan: 'pro' });
      }
      if (appliedPromo) incrementPromoCodeUsage(appliedPromo.code);
      setStep('success');
    } catch (err) {
      setPayError('حدث خطأ في معالجة الدفع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      style={{ direction: 'rtl' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-[430px] bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] overflow-hidden"
        style={{ maxHeight: '95dvh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── PLAN STEP ─────────────────────────────────────────────────────── */}
          {step === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center">
                  <X size={18} className="text-gray-400" />
                </button>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-1">
                    <Sparkles className="text-white" size={28} />
                  </div>
                  <h2 className="text-white font-black text-xl">Hasboba Pro</h2>
                </div>
                <div className="w-8" />
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-[#1a0f00] to-[#120a00] border border-yellow-500/20 rounded-2xl p-4 mb-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {savings > 0 && (
                    <span className="text-gray-500 text-sm line-through">{basePrice} {sym}</span>
                  )}
                  <span className="text-white font-black text-4xl" style={{ direction: 'ltr' }}>{finalPrice}</span>
                  <span className="text-yellow-400 font-bold text-base">{sym}</span>
                </div>
                <p className="text-gray-400 text-xs">/ شهرياً • يُجدَّد تلقائياً</p>
                {savings > 0 && (
                  <div className="mt-2 inline-block bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">
                    🎉 توفير {savings} {sym}!
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-col gap-3 mb-5">
                {proFeatures.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3">
                      <div className="text-right flex-1">
                        <p className="text-white text-sm font-bold">{f.label}</p>
                        <p className="text-gray-500 text-xs">{f.desc}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-yellow-400" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Promo Code */}
              <div className="mb-5 bg-[#111827] rounded-2xl p-3 border border-[#1f2937]">
                {appliedPromo ? (
                  <div className="flex items-center justify-between">
                    <button onClick={() => setAppliedPromo(null)} className="text-gray-500 hover:text-red-400 text-xs transition-colors">إزالة</button>
                    <div className="flex items-center gap-2 text-[#4ade80]">
                      <span className="text-sm font-bold">✓ خصم {appliedPromo.discountPercentage}% مُطبَّق</span>
                      <Tag size={15} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button onClick={handleApplyPromo} className="px-4 py-2 bg-[#4ade80] text-black text-sm font-bold rounded-xl hover:bg-[#4ade80]/90 transition-colors">تطبيق</button>
                      <input value={promoInput} onChange={e => setPromoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="كود الخصم (اختياري)"
                        className="flex-1 bg-[#0b1120] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right focus:outline-none focus:border-[#4ade80]/40 placeholder-gray-600" />
                    </div>
                    {promoError && <p className="text-red-400 text-xs text-right">{promoError}</p>}
                  </div>
                )}
              </div>

              {/* CTA */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('payment')}
                className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_24px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2">
                <CreditCard size={20} />
                اشترك الآن — {finalPrice} {sym}/شهر
              </motion.button>

              <p className="text-gray-600 text-[10px] text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={10} /> بياناتك مشفرة وآمنة بالكامل
              </p>
            </motion.div>
          )}

          {/* ─── PAYMENT STEP ──────────────────────────────────────────────────── */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="px-6 pb-8">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setStep('plan')} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center">
                  <ArrowLeft size={18} className="text-gray-400 rotate-180" />
                </button>
                <h3 className="text-white font-bold text-lg">بيانات الدفع</h3>
                <div className="w-8" />
              </div>

              {/* Summary Banner */}
              <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-2xl p-3 mb-5 flex items-center justify-between">
                <span className="text-[#4ade80] font-black text-lg">{finalPrice} {sym}/شهر</span>
                <span className="text-gray-400 text-sm">Hasboba Pro</span>
              </div>

              {/* Card Brand Row */}
              <div className="flex gap-2 mb-4 justify-end">
                {cardBrands.map(b => (
                  <span key={b} className="text-xs bg-[#111827] border border-[#1f2937] px-2.5 py-1.5 rounded-xl text-gray-400">{b}</span>
                ))}
              </div>

              {/* Card Number */}
              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-2 text-right font-medium">رقم البطاقة</p>
                <div className="relative">
                  <input value={cardNum} onChange={e => handleCardNum(e.target.value)}
                    placeholder="0000 0000 0000 0000" inputMode="numeric"
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40 pr-12 font-mono"
                    style={{ direction: 'ltr', textAlign: 'right' }} />
                  <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-2 text-right font-medium">اسم حامل البطاقة</p>
                <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                  placeholder="AHMED MOHAMED" className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40 uppercase tracking-wider" />
              </div>

              {/* Expiry + CVV */}
              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs mb-2 text-right font-medium">CVV</p>
                  <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••" inputMode="numeric" type="password"
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-center text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs mb-2 text-right font-medium">تاريخ الانتهاء</p>
                  <input value={expiry} onChange={e => handleExpiry(e.target.value)}
                    placeholder="MM/YY" inputMode="numeric"
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-center text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40 font-mono" />
                </div>
              </div>

              {payError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-right">
                  <p className="text-red-400 text-sm">{payError}</p>
                </div>
              )}

              {/* Pay Button */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={handlePayment} disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${
                  loading
                    ? 'bg-[#1f2937] text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_24px_rgba(251,191,36,0.4)]'
                }`}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    جاري معالجة الدفع...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    ادفع {finalPrice} {sym} بأمان
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-3">
                <Shield size={12} className="text-gray-600" />
                <p className="text-gray-600 text-[10px]">مدفوعاتك مشفرة بـ SSL 256-bit</p>
              </div>

              {/* Mock Note */}
              <div className="mt-4 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 text-center">
                <p className="text-blue-400/70 text-[10px]">هذه شاشة دفع تجريبية — لن يتم خصم أي مبلغ حقيقي</p>
              </div>
            </motion.div>
          )}

          {/* ─── SUCCESS STEP ──────────────────────────────────────────────────── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-6 pb-10 text-center">
              {/* Animated checkmark */}
              <div className="flex justify-center my-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center shadow-[0_0_60px_rgba(74,222,128,0.5)]"
                >
                  <Check size={52} className="text-black" strokeWidth={3} />
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-white font-black text-3xl mb-2">مبروك! 🎉</h2>
                <p className="text-[#4ade80] font-bold text-lg mb-3">أنت الآن Hasboba Pro!</p>
                <p className="text-gray-400 text-sm mb-8">جميع الميزات المتقدمة محلولة لك. استمتع بتجربة مالية ذكية.</p>

                <div className="flex flex-col gap-3 mb-8 text-right">
                  {proFeatures.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                        className="flex items-center gap-3 bg-[#4ade80]/5 border border-[#4ade80]/15 rounded-xl p-3">
                        <CheckCircle2 size={18} className="text-[#4ade80] shrink-0" />
                        <span className="text-white text-sm font-medium flex-1">{f.label}</span>
                        <Icon size={16} className="text-[#4ade80] shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-black text-base shadow-[0_0_24px_rgba(74,222,128,0.4)]">
                  ابدأ الاستخدام الآن!
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
