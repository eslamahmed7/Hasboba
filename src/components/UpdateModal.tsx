import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Shield, Zap, X } from 'lucide-react';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

interface Props {
  version: string;
  changelog: string;
  downloadUrl: string;
  onClose: () => void;
}

export function UpdateModal({ version, changelog, downloadUrl, onClose }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed this specific version
    const dismissed = localStorage.getItem(`checked_update_${version}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [version]);

  const handleDownload = () => {
    window.location.href = downloadUrl;
  };

  const handleDismiss = () => {
    localStorage.setItem(`checked_update_${version}`, 'true');
    setIsDismissed(true);
  };

  const getFeatureIcon = (text: string) => {
    if (text.includes('ذكاء')) return <Sparkles size={14} style={{ color: ACCENT }} />;
    if (text.includes('أمان') || text.includes('إصلاح')) return <Shield size={14} style={{ color: '#34d399' }} />;
    return <Zap size={14} style={{ color: '#facc15' }} />;
  };

  const features = changelog.split('\n').filter(l => l.trim() !== '');

  // ── Top Bar View ──
  if (isDismissed) {
    return (
      <motion.div 
        initial={{ y: -60, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: -60, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[80] shadow-lg cursor-pointer max-w-[430px] mx-auto"
        onClick={handleDownload}
      >
        <div className="flex items-center justify-between px-4 py-3"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)` }}>
          <div className="flex items-center gap-2">
            <Download size={18} className="text-white animate-bounce" />
            <span className="text-xs font-bold text-white">تحديث جديد متاح! اضغط هنا للتحديث الفوري</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="w-6 h-6 rounded-full flex items-center justify-center bg-black/20 text-white"
          >
            <X size={12} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Full Modal View ──
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-5 pointer-events-none">
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-sm rounded-[32px] overflow-hidden pointer-events-auto relative"
          style={{ background: BG_MODAL, border: `1px solid ${BORDER}`, boxShadow: `0 30px 60px rgba(0,0,0,0.5)` }}>
          
          <button onClick={handleDismiss} className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}>
            <X size={16} />
          </button>

          {/* Hero Section */}
          <div className="relative h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, rgba(0,173,181,0.2) 0%, transparent 100%)`, borderBottom: `1px solid ${BORDER}` }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: ACCENT }} />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: '#3b82f6' }} />
            </div>
            
            <div className="w-16 h-16 rounded-full flex items-center justify-center relative z-10 border"
              style={{ background: `rgba(0,173,181,0.2)`, borderColor: `rgba(0,173,181,0.3)`, boxShadow: `0 0 20px rgba(0,173,181,0.2)` }}>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Download size={28} style={{ color: ACCENT }} />
              </motion.div>
            </div>
          </div>

          <div className="px-6 pt-6 pb-8 text-center">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: ACCENT }}>
              إصدار جديد متوفر
            </div>
            
            <h3 className="text-white font-black text-2xl mb-2">تحديث حسبوبة {version}</h3>
            <p className="text-sm mb-6" style={{ color: '#6a9ca2' }}>اكتشف الميزات الجديدة والتحسينات في هذا الإصدار.</p>

            <div className="text-right space-y-3 mb-8 bg-black/20 p-4 rounded-2xl" style={{ border: `1px solid ${BORDER}` }}>
              {features.map((feature, i) => (
                <div key={i} className="flex items-center justify-end gap-3">
                  <span className="text-sm text-white">{feature.replace(/^-/, '').trim()}</span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: BG_CARD }}>
                    {getFeatureIcon(feature)}
                  </div>
                </div>
              ))}
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload}
              className="relative w-full py-4 rounded-2xl font-bold text-base text-white overflow-hidden group">
              <div className="absolute inset-0 transition-opacity" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, boxShadow: `0 0 12px rgba(0,173,181,0.5)` }} />
              <div className="relative flex items-center justify-center gap-2">
                <Download size={18} /> تحميل التحديث الآن
              </div>
            </motion.button>
            
            <button onClick={handleDismiss} className="mt-4 text-xs font-medium" style={{ color: '#4a7a80' }}>
              تذكيري لاحقاً
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
