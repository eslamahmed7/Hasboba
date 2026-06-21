import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Copy, Check, ChevronDown, RefreshCw, X, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

interface Props {
  onClose: () => void;
}

export function SubscriptionModal({ onClose }: Props) {
  const { user } = useApp();
  const [copied, setCopied] = useState<string | null>(null);
  const [showCVV, setShowCVV] = useState(false);
  const [showLimits, setShowLimits] = useState(false);

  const cardDetails = {
    number: '4111 2222 3333 4444',
    expiry: '12/26',
    cvv: '123',
    name: user?.name ? user.name.toUpperCase() : 'HASBOBA USER',
    balance: 1500,
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
        style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}>
        
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} />
        </div>
        
        <div className="px-5 pb-10">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
              <X size={18} style={{ color: '#6a9ca2' }} />
            </button>
            <h3 className="text-white font-bold text-lg">البطاقة الافتراضية</h3>
            <div className="w-9" />
          </div>

          <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: '#6a9ca2' }}>
            استخدم هذه البطاقة للدفع الآمن لاشتراكاتك عبر الإنترنت.
            <br />
            <span style={{ color: ACCENT }}>مربوطة مباشرة برصيدك في حسبوبة.</span>
          </p>

          {/* Virtual Card UI */}
          <div className="w-full aspect-[1.586/1] rounded-2xl p-6 relative overflow-hidden mb-6"
            style={{ background: `linear-gradient(135deg, ${BG_CARD} 0%, #008891 100%)`, boxShadow: `0 20px 40px rgba(0,173,181,0.2)`, border: `1px solid ${ACCENT}40` }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'white' }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ background: ACCENT }} />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-white font-black text-xl italic tracking-wider">HASBOBA</span>
                <CreditCard size={24} className="text-white opacity-80" />
              </div>
              
              <div>
                <p className="text-white/60 text-xs mb-1 font-medium tracking-widest">CARD NUMBER</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-xl sm:text-2xl tracking-[0.2em]">{cardDetails.number}</p>
                  <button onClick={() => handleCopy(cardDetails.number.replace(/\s/g, ''), 'number')} className="p-2 -mr-2">
                    {copied === 'number' ? <Check size={18} className="text-white" /> : <Copy size={18} className="text-white/60 hover:text-white" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-[10px] mb-0.5 font-medium tracking-widest">CARDHOLDER</p>
                  <p className="text-white text-sm tracking-wider">{cardDetails.name}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-white/60 text-[10px] mb-0.5 font-medium tracking-widest">VALID THRU</p>
                    <p className="text-white text-sm font-mono tracking-widest">{cardDetails.expiry}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-white/60 text-[10px] mb-0.5 font-medium tracking-widest">CVV</p>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => setShowCVV(!showCVV)}>
                      <p className="text-white text-sm font-mono tracking-widest">
                        {showCVV ? cardDetails.cvv : '•••'}
                      </p>
                      {showCVV ? <EyeOff size={12} className="text-white/60" /> : <Eye size={12} className="text-white/60" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
              <RefreshCw size={16} style={{ color: ACCENT }} />
              <span className="text-white text-sm font-bold">تغيير البطاقة</span>
            </button>
            <button className="py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
              <Lock size={16} style={{ color: '#facc15' }} />
              <span className="text-white text-sm font-bold">تجميد مؤقت</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(0,173,181,0.05)', border: `1px solid ${ACCENT}30` }}>
            <Shield size={20} style={{ color: ACCENT }} className="shrink-0" />
            <p className="text-xs text-right leading-relaxed" style={{ color: '#6a9ca2' }}>
              هذه البطاقة مخصصة فقط للدفع الإلكتروني وتُخصم المبالغ مباشرة من رصيدك المتاح. لا توجد أي رسوم مخفية.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
